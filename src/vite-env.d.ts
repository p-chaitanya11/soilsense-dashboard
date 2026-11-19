/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_THINGSPEAK_CHANNEL_ID?: string;
  readonly VITE_THINGSPEAK_READ_API_KEY?: string;
  readonly VITE_AUTO_REFRESH_SECONDS?: string;
  readonly VITE_ENABLE_DEMO_FALLBACK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
