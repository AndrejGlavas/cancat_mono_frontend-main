/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENV: 'staging' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __IS_DEV__: boolean