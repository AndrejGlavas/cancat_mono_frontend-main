import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

interface EnvConfig {
  target: string;
  mode: 'development' | 'staging' | 'production';
  name: string;
}

// Helper function to get environment-specific configuration
const getEnvConfig = (mode: string): EnvConfig => {
  const configs: Record<string, EnvConfig> = {
    production: {
      target: 'https://app.cancat.io',
      mode: 'production',
      name: 'PRODUCTION'
    },
    staging: {
      target: 'https://staging.cancat.io',
      mode: 'staging',
      name: 'STAGING'
    },
    development: {
      target: 'http://localhost:3001',
      mode: 'development',
      name: 'DEVELOPMENT'
    }
  };

  // Default to development if mode not recognized
  return configs[mode] || configs.development;
};

export default defineConfig(({ mode }) => {
  const envConfig = getEnvConfig(mode);


  return {
    plugins: [react()],
    define: {
      __IS_DEV__: mode === 'development',
      __IS_STAGING__: mode === 'staging',
      __MODE__: JSON.stringify(envConfig.mode),
      __ENV_NAME__: JSON.stringify(envConfig.name),
      __API_URL__: JSON.stringify(envConfig.target),
    },
    server: {
      proxy: {
        '/api': {
          target: envConfig.target,
          changeOrigin: true,
          secure: mode === 'production',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-${envConfig.mode}-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-[hash]-${envConfig.mode}-${Date.now()}.js`,
          assetFileNames: `assets/[name]-[hash]-${envConfig.mode}-${Date.now()}.[ext]`,
        },
      },
      manifest: true,
      emptyOutDir: true,
    },
  };
}) as UserConfig;