/// <reference types="vite/client" />

// Augment the Window interface for Tauri
interface Window {
  __TAURI__?: {
    invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
    [key: string]: unknown;
  };
}
