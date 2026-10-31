/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://abcd.supabase.co (optional: without it data stays in the browser). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable (anon) key — safe to expose in the browser. Never put the secret key here. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
