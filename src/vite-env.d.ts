/// <reference types="vite/client" />
/// <reference path="./types/speech.d.ts" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
