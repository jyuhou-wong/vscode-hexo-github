import path from 'node:path'
import process from 'node:process'

import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'

import { createVitePlugins } from './build/vite'
import { exclude, include } from './build/vite/optimize'
import { createServerConfig } from './build/vite/server'

export default ({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)

  return {
    base: env.VITE_APP_PUBLIC_PATH,
    plugins: createVitePlugins(mode),

    server: createServerConfig(mode),

    resolve: {
      alias: {
        '@': path.join(__dirname, './src'),
        '~': path.join(__dirname, './src/assets'),
        '~root': path.join(__dirname, '.'),
        'joi': 'joi/dist/joi-browser.min.js',
      },
    },

    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 2048,
      outDir: env.VITE_APP_OUT_DIR || 'dist',
    },

    optimizeDeps: { include, exclude },
  }
}
