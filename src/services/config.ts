// src/services/config.ts
interface Config {
    API_URL: string;
    ENV: string;
  }
  
  export async function getConfig(): Promise<Config> {
    if (import.meta.env.DEV) {
      return {
        API_URL: import.meta.env.VITE_API_URL,
        ENV: import.meta.env.VITE_ENV
      };
    }
    
    // In production, fetch from backend
    const response = await fetch('/api/config');
    return response.json();
  }
