/**
 * hardware.ts
 * Global AgroQuantum hardware connection state manager.
 *
 * Status flow:
 *   disconnected → connecting → connected
 *                             → error (timeout / no ACK)
 *   connected    → disconnected (manual disconnect)
 *
 * The "connect" action fires a simulated async ping.
 * Replace `simulateHardwarePing` with a real fetch/WebSocket
 * call to your ESP32 gateway when the hardware is available.
 */

import { useState, useEffect, useCallback } from 'react';

// ─── types ────────────────────────────────────────────────
export type HardwareStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface HardwareState {
  status: HardwareStatus;
  /** Only true when status === 'connected' */
  isConnected: boolean;
  errorMessage: string | null;
}

// ─── event bus (cross-tab / cross-component) ──────────────
const EVENT_NAME = 'agriX_hardware_status_changed';
const STORAGE_KEY = 'agriX_hardwareStatus';

function persist(status: HardwareStatus) {
  try { localStorage.setItem(STORAGE_KEY, status); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: status }));
}

function loadPersistedStatus(): HardwareStatus {
  if (typeof window === 'undefined') return 'disconnected';
  const raw = localStorage.getItem(STORAGE_KEY) as HardwareStatus | null;
  // Never boot into 'connecting' — that's a transient state
  if (raw === 'connected') return 'connected';
  return 'disconnected';
}

// ─── simulated ping ───────────────────────────────────────
/**
 * Replace this with a real call, e.g.:
 *   const res = await fetch('http://192.168.4.1/api/ping', { signal });
 *   return res.ok;
 *
 * The function must resolve `true` (ACK) or `false` / throw (no ACK).
 */
async function simulateHardwarePing(signal: AbortSignal): Promise<boolean> {
  // Simulate a 2-second handshake delay before ACK
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => resolve(true), 2000);
    signal.addEventListener('abort', () => { clearTimeout(id); reject(new DOMException('Aborted', 'AbortError')); });
  });
}

// ─── hook ─────────────────────────────────────────────────
export interface HardwareHook {
  status: HardwareStatus;
  isConnected: boolean;
  isConnecting: boolean;
  errorMessage: string | null;
  connect: () => void;
  disconnect: () => void;
}

export function useHardwareConnection(): HardwareHook {
  const [status, setStatus] = useState<HardwareStatus>(loadPersistedStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Listen for state changes fired from other components / tabs
  useEffect(() => {
    const onEvent = (e: Event) => {
      const s = (e as CustomEvent<HardwareStatus>).detail;
      setStatus(s);
      if (s !== 'error') setErrorMessage(null);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const s = (e.newValue as HardwareStatus) ?? 'disconnected';
        setStatus(s);
        if (s !== 'error') setErrorMessage(null);
      }
    };
    window.addEventListener(EVENT_NAME, onEvent);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const connect = useCallback(() => {
    if (status === 'connecting' || status === 'connected') return;
    setStatus('connecting');
    setErrorMessage(null);
    persist('connecting');

    const controller = new AbortController();
    const TIMEOUT_MS = 5000;
    const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

    simulateHardwarePing(controller.signal)
      .then((ack) => {
        clearTimeout(timeoutId);
        if (ack) {
          setStatus('connected');
          setErrorMessage(null);
          persist('connected');
        } else {
          const msg = 'Hardware offline. Check ESP32 power/network connection.';
          setStatus('error');
          setErrorMessage(msg);
          persist('error');
        }
      })
      .catch((err: Error) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          const msg = 'Hardware offline. Check ESP32 power/network connection.';
          setStatus('error');
          setErrorMessage(msg);
          persist('error');
        } else {
          const msg = `Connection error: ${err.message}`;
          setStatus('error');
          setErrorMessage(msg);
          persist('error');
        }
      });
  }, [status]);

  const disconnect = useCallback(() => {
    setStatus('disconnected');
    setErrorMessage(null);
    persist('disconnected');
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    errorMessage,
    connect,
    disconnect,
  };
}

// ─── legacy boolean shim (used by SatelliteView / TelemetryView for guards) ──
export function useHardwareIsConnected(): boolean {
  const [status, setStatus] = useState<HardwareStatus>(loadPersistedStatus);
  useEffect(() => {
    const onEvent = (e: Event) => setStatus((e as CustomEvent<HardwareStatus>).detail);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStatus((e.newValue as HardwareStatus) ?? 'disconnected');
    };
    window.addEventListener(EVENT_NAME, onEvent);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return status === 'connected';
}
