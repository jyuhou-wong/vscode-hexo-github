import process from 'node:process'

import { loadEnv } from 'vite'

export function createServerConfig(mode: string) {
  const env = loadEnv(mode, process.cwd())

  console.warn(`Vite mode: ${mode}`)
  console.warn(`Vite Server Port: ${env.VITE_APP_PORT}`)
  console.warn(`Vite API Base URL: ${env.VITE_APP_API_BASE_URL}`)
  console.warn(`Vite API Proxy Target: ${env.VITE_APP_API_BASE_TARGET}`)

  if (!env.VITE_APP_PORT || !env.VITE_APP_API_BASE_URL || !env.VITE_APP_API_BASE_TARGET) {
    console.error('Vite server configuration is incomplete. Please check your development environment variables.')
    return undefined
  }

  const baseUrlRegex = new RegExp(`^${env.VITE_APP_API_BASE_URL}`)

  return {
    host: true,
    port: Number.parseInt(env.VITE_APP_PORT),
    proxy: {
      [env.VITE_APP_API_BASE_URL]: {
        target: env.VITE_APP_API_BASE_TARGET,
        ws: false,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(baseUrlRegex, ''),
      },
    },
  }
}
