import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
  VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EAC PWA',
        short_name: 'EAC',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1890ff',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      strategy: 'injectManifest',
      injectManifest: {
        swSrc: 'src/sw/sw.js',
        swDest: 'sw.js'
      },
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/index.html'
      }
  } as any)
  ]
})
