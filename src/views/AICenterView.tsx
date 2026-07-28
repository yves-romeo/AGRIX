import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Camera,
  Upload,
  ScanLine,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  RotateCcw,
  Mic,
  Square,
  Volume2,
  Sparkles,
  Leaf,
  Send,
  MessageSquare,
  User,
  Bot,
  Globe,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { SectionCard } from '../components/ui';
import { useLang } from '../lib/i18n';
import {
  analyzeCropImage,
  isGeminiConfigured,
  sendAgriChatMessage,
  severityBarColor,
  severityBarTone,
  type VisionDiagnostic,
} from '../lib/gemini';

type Phase = 'idle' | 'preview' | 'camera' | 'analyzing' | 'rejected' | 'result';
type TabId = 'scanner' | 'assistant';
type SpeechLang = 'en-US' | 'rw-RW';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}



const QUICK_PROMPTS = {
  en: [
    'How to treat potato blight in Nyagatare?',
    'Best NPK fertilizer ratio for maize in Rwanda?',
    'How to control leaf miners on beans?',
    'What is the weather outlook for planting season in Western Province?',
  ],
  rw: [
    'Uburyo bwo kuvura ikibore cy\'ibirayi i Nyagatare?',
    'Ifumbire ya NPK nziza y\'ibigori mu Rwanda?',
    'Uburyo bwo kurwanya isazi y\'amababi ku mbuto?',
    'Iteganyagihe ry\'ihinga mu Ntara y\'Iburengerazuba?',
  ],
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function cleanTextForTTS(text: string): string {
  return text
    .replace(/###/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/- /g, ' ')
    .replace(/\d+\./g, '');
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-soft">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
      <p className="flex-1 leading-relaxed font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 hover:bg-red-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function AICenterView() {
  const { t, lang } = useLang();
  const geminiReady = useMemo(() => isGeminiConfigured(), []);

  const [activeTab, setActiveTab] = useState<TabId>('scanner');
  const [apiBannerDismissed, setApiBannerDismissed] = useState(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<VisionDiagnostic | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatLang, setChatLang] = useState<SpeechLang>('en-US');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scannerRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setChatLang(lang === 'rw' ? 'rw-RW' : 'en-US');
  }, [lang]);

  useEffect(() => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: t.aiAssistantGreeting,
        timestamp: new Date(),
      },
    ]);
  }, [t.aiAssistantGreeting]);

  useEffect(() => {
    return () => {
      if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current?.abort();
      scannerRecognitionRef.current?.abort();
      streamRef.current?.getTracks().forEach((tk) => tk.stop());
    };
  }, []);

  const resolveErrorMessage = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof Error) {
        if (err.message === 'GEMINI_API_KEY_MISSING') return t.aiGeminiRequired;
        return err.message || fallback;
      }
      return fallback;
    },
    [t.aiGeminiRequired],
  );

  const runVisionAnalysis = useCallback(
    async (dataUrl: string) => {
      setScannerError(null);
      setPhase('analyzing');

      if (!geminiReady) {
        setScannerError(t.aiGeminiRequired);
        setPhase('preview');
        return;
      }

      try {
        const result = await analyzeCropImage(dataUrl);
        if (!result.isCropImage) {
          setDiagnostic(null);
          setPhase('rejected');
          return;
        }
        setDiagnostic(result);
        setPhase('result');
      } catch (err) {
        setScannerError(resolveErrorMessage(err, t.aiNetworkError));
        setPhase('preview');
      }
    },
    [geminiReady, resolveErrorMessage, t.aiGeminiRequired, t.aiNetworkError],
  );

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setPhase('preview');
      setScannerError(null);
    };
    reader.onerror = () => {
      setScannerError(t.aiNetworkError);
    };
    reader.readAsDataURL(file);
  }, [t.aiNetworkError]);



  const startCamera = useCallback(async () => {
    setScannerError(null);
    setPhase('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setScannerError(
        lang === 'rw'
          ? 'Ntibyashoboye gufata kamera. Koresha upload cyangwa reba permissions.'
          : 'Could not access camera. Please use file upload instead or check browser camera permissions.',
      );
      setPhase('idle');
    }
  }, [lang]);

  const captureCameraPhoto = useCallback(() => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageSrc(dataUrl);
      setPhase('preview');
    }
    streamRef.current?.getTracks().forEach((tk) => tk.stop());
    streamRef.current = null;
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((tk) => tk.stop());
    streamRef.current = null;
    setPhase('idle');
  }, []);

  const resetScanner = useCallback(() => {
    setPhase('idle');
    setImageSrc(null);
    setDiagnostic(null);
    setScannerError(null);
  }, []);

  const stopSpeech = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startSpeech = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setChatError(t.aiSpeechNotSupported);
      return;
    }

    setChatError(null);

    try {
      const rec = new Ctor();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = chatLang;

      rec.onstart = () => setIsListening(true);

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        setChatError(t.aiSpeechNotSupported);
      };

      rec.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
      setChatError(t.aiSpeechNotSupported);
    }
  }, [chatLang, t.aiSpeechNotSupported]);

  const toggleSpeech = () => {
    if (isListening) stopSpeech();
    else startSpeech();
  };

  const handleSend = useCallback(
    async (textOverride?: string) => {
      const text = textOverride !== undefined ? textOverride : inputValue;
      if (!text.trim()) return;

      if (textOverride === undefined) setInputValue('');
      if (isListening) stopSpeech();

      setChatError(null);

      const userMsg: Message = {
        id: `msg-${Date.now()}-user`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);

      if (!geminiReady) {
        setIsTyping(false);
        setChatError(t.aiGeminiRequired);
        return;
      }

      try {
        const history = messages
          .filter((m) => m.id !== 'msg-welcome')
          .map((m) => ({
            role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
            text: m.text,
          }));

        const activeLang = chatLang === 'rw-RW' ? 'rw' : 'en';
        const reply = await sendAgriChatMessage(history, text.trim(), activeLang);
        const assistantMsg: Message = {
          id: `msg-${Date.now()}-assistant`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setChatError(resolveErrorMessage(err, t.aiNetworkError));
      } finally {
        setIsTyping(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      }
    },
    [
      inputValue,
      isListening,
      stopSpeech,
      geminiReady,
      messages,
      resolveErrorMessage,
      t.aiGeminiRequired,
      t.aiNetworkError,
    ],
  );

  const speakMessage = (id: string, text: string) => {
    if (!isSpeechSynthesisSupported()) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanTextForTTS(text));
    const voices = window.speechSynthesis.getVoices();
    const preferRw = chatLang === 'rw-RW' || lang === 'rw';

    if (preferRw) {
      const rwVoice = voices.find((v) => v.lang.startsWith('rw') || v.lang.startsWith('sw'));
      utterance.lang = rwVoice?.lang ?? 'rw-RW';
      if (rwVoice) utterance.voice = rwVoice;
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
  };

  const handleAskAboutDiagnostic = (diag: VisionDiagnostic) => {
    const question =
      lang === 'rw'
        ? `Nkeneye amakuru arambuye ku ndwara ya ${diag.condition} ku gihingwa cya ${diag.affectedCrop}. Ni iyihe miti n'uburyo bwo kuyirwanya muri Nyagatare/Musanze?`
        : `I need detailed advice for ${diag.condition} affecting ${diag.affectedCrop} (severity ${diag.severityPercent}%). What organic and chemical treatments work best in Rwanda?`;

    setActiveTab('assistant');
    void handleSend(question);
  };

  const quickPrompts = QUICK_PROMPTS[lang];

  return (
    <div className="space-y-6">
      {/* Missing API Key Banner */}
      {!geminiReady && !apiBannerDismissed && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-soft">
          <KeyRound className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-bold text-amber-950">Gemini AI Key Not Configured</p>
            <p className="mt-0.5 leading-relaxed text-amber-900">{t.aiApiKeyMissing}</p>
          </div>
          <button
            type="button"
            onClick={() => setApiBannerDismissed(true)}
            className="shrink-0 rounded-lg bg-amber-200/80 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-300 transition-colors"
          >
            {t.aiApiKeyBannerDismiss}
          </button>
        </div>
      )}

      {/* Top Segmented Navigation Bar */}
      <div className="relative max-w-md mx-auto p-1.5 bg-slate2-100/90 backdrop-blur border border-slate2-250 rounded-2xl flex shadow-soft">
        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'scanner'
              ? 'bg-white text-forest-800 shadow-card scale-[1.02] ring-1 ring-forest-500/20'
              : 'text-slate2-600 hover:text-slate2-900 hover:bg-white/40'
          }`}
        >
          <Camera className="h-4.5 w-4.5 text-forest-600" />
          <span>{t.aiTabScanner}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('assistant');
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'assistant'
              ? 'bg-white text-forest-800 shadow-card scale-[1.02] ring-1 ring-forest-500/20'
              : 'text-slate2-600 hover:text-slate2-900 hover:bg-white/40'
          }`}
        >
          <MessageSquare className="h-4.5 w-4.5 text-forest-600" />
          <span>{t.aiTabAssistant}</span>
        </button>
      </div>

      {/* TAB 1: CROP SCANNER */}
      <div className={activeTab === 'scanner' ? 'space-y-6 animate-fade-in' : 'hidden'}>
        {scannerError && <ErrorBanner message={scannerError} onDismiss={() => setScannerError(null)} />}

        {phase === 'idle' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFileSelect(f);
            }}
            className={`relative card overflow-hidden transition-all duration-300 ${
              dragOver ? 'ring-2 ring-forest-500 shadow-glow scale-[1.01]' : 'hover:shadow-card'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-forest-50/80 via-white to-forest-50/30 pointer-events-none" />
            <div className="relative px-6 py-12 sm:py-16 flex flex-col items-center text-center">
              <div className="grid place-items-center h-16 w-16 rounded-2xl bg-forest-600 text-white shadow-card mb-4">
                <ScanLine className="h-8 w-8" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate2-900">{t.aiTitle}</h2>
              <p className="text-sm text-slate2-500 mt-2 max-w-lg leading-relaxed">{t.aiSubtitle}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
                <button type="button" onClick={() => void startCamera()} className="btn-primary">
                  <Camera className="h-4.5 w-4.5" /> {t.aiTakePhoto}
                </button>
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost border border-slate2-250">
                  <Upload className="h-4.5 w-4.5 text-forest-600" /> {t.aiUpload}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase: Preview Selected Image before Analysis */}
        {phase === 'preview' && imageSrc && (
          <SectionCard title="Crop Image Selected" subtitle="Review your leaf photo, then tap 'Scan Leaf Now' to run AI health diagnostics.">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-slate2-900 aspect-square max-w-sm w-full shadow-card border-2 border-slate2-200">
                <img src={imageSrc} alt="Selected crop leaf" className="h-full w-full object-cover" />
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => void runVisionAnalysis(imageSrc)}
                  className="btn-primary !px-8 !py-3 font-bold text-sm shadow-card"
                >
                  <Sparkles className="h-5 w-5" /> Scan Leaf Now
                </button>
                <button type="button" onClick={resetScanner} className="btn-ghost border border-slate2-250">
                  <RotateCcw className="h-4 w-4" /> Change Photo
                </button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Phase: Live Camera Stream */}
        {phase === 'camera' && (
          <SectionCard title={t.aiTakePhoto}>
            <div className="relative rounded-2xl overflow-hidden bg-slate2-900 aspect-[4/3] max-w-2xl mx-auto shadow-card">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-6 border-2 border-forest-400/70 rounded-xl pointer-events-none" />
              <div className="absolute top-4 left-4 chip bg-slate2-900/80 text-forest-200 backdrop-blur-sm border border-slate2-750">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse-dot" /> LIVE CAMERA
              </div>
              <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="grid place-items-center h-12 w-12 rounded-full bg-slate2-900/80 backdrop-blur text-white hover:bg-slate2-800 transition-colors border border-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={captureCameraPhoto}
                  className="grid place-items-center h-20 w-20 rounded-full bg-white text-forest-750 shadow-card ring-4 ring-white/30 active:scale-90 transition-all hover:scale-105"
                  aria-label="Capture Photo"
                >
                  <Camera className="h-9 w-9" />
                </button>
                <div className="h-12 w-12" />
              </div>
            </div>
          </SectionCard>
        )}

        {/* Phase: Analyzing with Gemini Vision API */}
        {phase === 'analyzing' && (
          <SectionCard>
            <div className="flex flex-col items-center py-20 text-center">
              <div className="relative grid place-items-center h-20 w-20 rounded-2xl bg-forest-50 text-forest-600 mb-4 shadow-soft">
                <Loader2 className="h-10 w-10 animate-spin text-forest-600" />
              </div>
              <h3 className="font-display font-extrabold text-slate2-900 text-xl">{t.aiAnalyzing}</h3>
              <p className="text-sm text-slate2-500 mt-2 max-w-sm">{t.aiAnalyzingSub}</p>
              <div className="mt-6 w-64 h-2.5 rounded-full bg-slate2-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-forest-400 to-forest-600 animate-shimmer" style={{ width: '85%' }} />
              </div>
            </div>
          </SectionCard>
        )}

        {/* Phase: Non-crop image rejected */}
        {phase === 'rejected' && (
          <SectionCard>
            <div className="flex flex-col items-center py-12 text-center max-w-md mx-auto">
              <div className="grid place-items-center h-16 w-16 rounded-2xl bg-red-50 text-red-600 mb-4 shadow-soft">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="font-display font-extrabold text-slate2-900 text-lg">{t.aiRejected}</h3>
              <p className="text-sm text-slate2-600 mt-2.5 leading-relaxed">
                {lang === 'en' ? t.aiRejectEn : t.aiRejectRw || 'System-i yakira amashusho y\'amababi n\'ibihingwa gusa.'}
              </p>
              <button type="button" onClick={resetScanner} className="btn-primary mt-6">
                <RotateCcw className="h-4 w-4" /> {t.aiTryAgain}
              </button>
            </div>
          </SectionCard>
        )}

        {/* Phase: Live Vision AI Diagnostic Result */}
        {phase === 'result' && diagnostic && imageSrc && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="chip bg-forest-50 text-forest-800 border border-forest-200 py-1.5 px-3 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-forest-600" /> {t.aiResult}
                </span>
                <span className="chip bg-slate2-100 text-slate2-700 py-1.5 px-3 font-bold">{diagnostic.affectedCrop}</span>
              </div>
              <button type="button" onClick={resetScanner} className="btn-ghost border border-slate2-250">
                <RotateCcw className="h-4 w-4" /> {t.aiNewScan}
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <SectionCard title={t.aiAnalyzedSample} subtitle={t.aiBboxNote}>
                <div className="flex flex-col space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate2-100 aspect-square shadow-inner border border-slate2-200">
                    <img src={imageSrc} alt="Crop sample" className="absolute inset-0 h-full w-full object-cover" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAskAboutDiagnostic(diagnostic)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 font-bold text-sm transition-colors"
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    <span>{lang === 'rw' ? 'Baza umujyanama kuri iyi ndwara' : 'Ask Agri AI Assistant about this scan'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </SectionCard>

              <DiagnosticCard diagnostic={diagnostic} lang={lang} t={t} />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate2-400">
              <Sparkles className="h-4 w-4 text-forest-550" />
              <span>{t.aiDisclaimer}</span>
            </div>
          </div>
        )}
      </div>

      {/* TAB 2: AGRI AI ASSISTANT */}
      <div className={activeTab === 'assistant' ? 'flex flex-col space-y-4 animate-fade-in' : 'hidden'}>
        <SectionCard
          title={lang === 'rw' ? 'Umunyamabanga AI w\'Ubuhinzi' : 'Interactive Agri AI Assistant'}
          subtitle={
            lang === 'rw'
              ? 'Umutega-matwi n\'Umujyanama w\'ubutaka, ibihingwa n\'imiti (Gemini AI + Voice)'
              : 'Live Chat & Voice Assistant for Crop Management (Gemini AI + Voice)'
          }
        >
          {chatError && <div className="mb-4"><ErrorBanner message={chatError} onDismiss={() => setChatError(null)} /></div>}

          {/* Quick Prompts */}
          <div className="flex flex-col gap-2 mb-4">
            <p className="text-[10px] font-bold text-slate2-400 uppercase tracking-wider">
              {lang === 'rw' ? 'Ibibazo Byerekanwa' : 'Quick Suggestion Chips'}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSend(prompt)}
                  disabled={isTyping}
                  className="chip bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-150 py-1.5 px-3 text-xs rounded-xl transition-all hover:scale-[1.02] text-left active:scale-[0.98] disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex flex-col h-[440px] border border-slate2-200/80 rounded-2xl bg-slate2-50/50 overflow-hidden relative shadow-inner">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      msg.sender === 'user'
                        ? 'bg-forest-100 border-forest-200 text-forest-755'
                        : 'bg-white border-slate2-200 text-slate2-600 shadow-soft'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5 text-forest-600" />}
                  </div>

                  <div className="flex flex-col">
                    <div
                      className={`p-4 rounded-2xl shadow-soft ${
                        msg.sender === 'user'
                          ? 'bg-forest-600 text-white rounded-tr-none'
                          : 'bg-white text-slate2-800 border border-slate2-200/80 rounded-tl-none prose prose-sm max-w-none'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap space-y-2 font-medium">
                          {msg.text.split('\n').map((line, idx) => {
                            if (line.startsWith('###')) {
                              return (
                                <h4 key={idx} className="font-display font-bold text-base text-forest-800 mt-2 mb-1">
                                  {line.replace('###', '').trim()}
                                </h4>
                              );
                            }
                            if (/^[-*]\s/.test(line) || /^\d+\./.test(line)) {
                              return (
                                <p key={idx} className="text-sm pl-2.5 border-l-2 border-forest-400 font-medium text-slate2-750 my-1">
                                  {line}
                                </p>
                              );
                            }
                            return (
                              <p key={idx} className="text-slate2-700 leading-relaxed text-sm my-1">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 mt-1.5 text-[10px] text-slate2-400 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.sender === 'assistant' && isSpeechSynthesisSupported() && (
                        <>
                          <span>·</span>
                          {speakingMsgId === msg.id ? (
                            <button
                              type="button"
                              onClick={stopTTS}
                              className="flex items-center gap-1 font-bold px-2 py-0.5 rounded hover:bg-slate2-100 transition-colors text-red-500"
                            >
                              <Square className="h-3 w-3 fill-current" />
                              <span>⏹ {t.aiStopTTS}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => speakMessage(msg.id, msg.text)}
                              className="flex items-center gap-1 font-bold px-2 py-0.5 rounded hover:bg-slate2-100 transition-colors text-forest-650"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                              <span>🔊 {t.aiReadAloud}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-white border border-slate2-200 shrink-0">
                    <Loader2 className="h-4 w-4 animate-spin text-forest-600" />
                  </div>
                  <div className="p-3.5 bg-white border border-slate2-250 rounded-2xl rounded-tl-none shadow-soft">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2.5 h-2.5 bg-forest-500 rounded-full animate-bounce" />
                      <span className="w-2.5 h-2.5 bg-forest-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2.5 h-2.5 bg-forest-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Listening Speech Recognition Overlay */}
            {isListening && (
              <div className="absolute inset-0 bg-forest-900/20 backdrop-blur-sm flex flex-col items-center justify-center z-15 animate-fade-in">
                <div className="bg-white/95 border border-forest-100 rounded-2xl p-6 shadow-card flex flex-col items-center max-w-xs text-center">
                  <div className="relative grid place-items-center h-16 w-16 rounded-full bg-red-50 text-red-600 mb-3">
                    <span className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" />
                    <Mic className="h-8 w-8 text-red-500" />
                  </div>
                  <h4 className="font-display font-extrabold text-slate2-900 text-sm">{t.aiListening}</h4>
                  <p className="text-xs text-slate2-500 mt-1 leading-normal">
                    {lang === 'rw'
                      ? 'Turi kumviriza ijwi ryawe mu Kinyarwanda cyangwa Icyongereza...'
                      : 'Listening in English or Kinyarwanda — speak your question clearly.'}
                  </p>
                  <button
                    type="button"
                    onClick={stopSpeech}
                    className="mt-4 px-4 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs transition-colors hover:bg-red-600"
                  >
                    Cancel Listening
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Voice Input Toolbar & Chat Input */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-slate2-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-forest-500" />
                <span>{t.aiVoiceLang}</span>
              </span>
              <select
                value={chatLang}
                onChange={(e) => setChatLang(e.target.value as SpeechLang)}
                className="bg-white border border-slate2-250 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest-500 text-slate2-800 cursor-pointer"
              >
                <option value="en-US">English (US)</option>
                <option value="rw-RW">Kinyarwanda (RW)</option>
              </select>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend();
              }}
              className="flex-1 flex gap-2 items-center bg-white border border-slate2-250 rounded-xl p-1.5 px-2.5 shadow-soft focus-within:ring-1 focus-within:ring-forest-500 transition-shadow"
            >
              <button
                type="button"
                onClick={toggleSpeech}
                disabled={!isSpeechRecognitionSupported()}
                title={
                  isSpeechRecognitionSupported()
                    ? 'Use voice input (Web Speech API)'
                    : t.aiSpeechNotSupported
                }
                className={`grid place-items-center h-10 w-10 rounded-lg hover:bg-slate2-50 active:scale-95 shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isListening ? 'text-red-500 bg-red-50 ring-2 ring-red-400' : 'text-slate2-600 hover:text-slate2-900'
                }`}
              >
                <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.aiChatPlaceholder}
                className="flex-1 min-w-0 bg-transparent text-sm font-medium border-0 focus:outline-none focus:ring-0 text-slate2-900 placeholder-slate2-400 py-2 px-1"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="grid place-items-center h-10 w-10 rounded-lg bg-forest-600 text-white shadow-soft transition-all hover:bg-forest-750 disabled:opacity-30 active:scale-[0.96] shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function DiagnosticCard({
  diagnostic,
  lang,
  t,
}: {
  diagnostic: VisionDiagnostic;
  lang: 'en' | 'rw';
  t: ReturnType<typeof useLang>['t'];
}) {
  const [playing, setPlaying] = useState(false);
  const barColor = severityBarColor(diagnostic.severityPercent);
  const tone = severityBarTone(diagnostic.severityPercent);

  const toneClasses = {
    good: 'bg-green-50 text-green-700 border-green-200',
    warn: 'bg-amber-50 text-amber-700 border-amber-200',
    bad: 'bg-red-50 text-red-700 border-red-200',
  };

  const summary = lang === 'rw' ? diagnostic.summaryRw : diagnostic.summaryEn;
  const symptoms = lang === 'rw' ? diagnostic.symptomsRw : diagnostic.symptomsEn;
  const prevention = lang === 'rw' ? diagnostic.preventionRw : diagnostic.preventionEn;
  const treatment = lang === 'rw' ? diagnostic.treatmentRw : diagnostic.treatmentEn;

  const handleTTS = () => {
    if (!isSpeechSynthesisSupported()) return;

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const fullText = `${diagnostic.condition}. ${summary}. ${symptoms}. ${treatment}`;
    const utterance = new SpeechSynthesisUtterance(cleanTextForTTS(fullText));
    utterance.lang = lang === 'rw' ? 'rw-RW' : 'en-US';
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="card p-0 overflow-hidden flex flex-col shadow-card">
      <div className="flex items-center justify-between px-5 py-4 bg-forest-600 text-white">
        <div>
          <p className="font-display font-extrabold text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> {t.aiReadoutTitle}
          </p>
          <p className="text-[11px] text-forest-200 mt-0.5">
            {diagnostic.condition} · {diagnostic.confidence}% confidence
          </p>
        </div>
        {isSpeechSynthesisSupported() && (
          <button
            type="button"
            onClick={handleTTS}
            className="grid place-items-center h-10 w-10 rounded-xl bg-white/15 hover:bg-white/25 transition-colors border border-white/10"
            aria-label={playing ? t.aiStopTTS : t.aiPlayTTS}
            title={playing ? t.aiStopTTS : 'Play audio summary'}
          >
            {playing ? <Square className="h-4 w-4 fill-current text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
          </button>
        )}
      </div>

      <div className="p-5 space-y-4 flex-1 bg-white">
        {/* Severity Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate2-400">{t.aiSeverity}</span>
            <span className={`chip text-[10px] font-extrabold uppercase border ${toneClasses[tone]}`}>
              {diagnostic.severityLevel} · {diagnostic.severityPercent}%
            </span>
          </div>
          <div className="h-3.5 rounded-full bg-slate2-100 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${diagnostic.severityPercent}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate2-400 uppercase">
            <span className="text-green-600">Low (&lt;33%)</span>
            <span className="text-amber-600">Moderate (34-66%)</span>
            <span className="text-red-600">High (&gt;66%)</span>
          </div>
        </div>

        <p className="text-sm text-slate2-800 leading-relaxed font-semibold">{summary}</p>

        <div className="space-y-3.5">
          <SectionBlock heading={t.aiSymptoms} body={symptoms} />
          <SectionBlock heading={t.aiPrevention} body={prevention} />
          <SectionBlock heading={t.aiTreatment} body={treatment} />
        </div>

        <div className="p-4 bg-slate2-50 border border-slate2-100 rounded-xl space-y-3">
          <p className="text-[10px] font-bold text-slate2-400 uppercase tracking-wider border-b border-slate2-200 pb-1 flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-forest-600" />
            <span>{t.aiOrganic} · {t.aiChemical}</span>
          </p>
          <div className="space-y-2">
            <div>
              <span className="text-[9px] font-bold text-forest-750 bg-forest-50 border border-forest-150 px-2 py-0.5 rounded uppercase tracking-wider">
                Organic &amp; Chemical Treatments
              </span>
              <p className="text-xs text-slate2-700 mt-1 font-semibold leading-relaxed">
                <strong>{t.aiOrganic}:</strong> {diagnostic.organicTreatments}
              </p>
              <p className="text-xs text-slate2-700 mt-1 font-semibold leading-relaxed">
                <strong>{t.aiChemical}:</strong> {diagnostic.chemicalTreatments}
              </p>
            </div>
            <div className="border-t border-slate2-200/60 pt-2">
              <span className="text-[9px] font-bold text-forest-750 bg-forest-50 border border-forest-150 px-2 py-0.5 rounded uppercase tracking-wider">
                Kinyarwanda Summary
              </span>
              <p className="text-xs text-slate2-700 mt-1 font-semibold leading-relaxed">{diagnostic.summaryRw}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="border-l-2 border-forest-400 pl-3">
      <p className="text-[10.5px] font-extrabold text-forest-750 uppercase tracking-wider">{heading}</p>
      <p className="text-sm text-slate2-800 mt-1 leading-relaxed font-semibold">{body}</p>
    </div>
  );
}
