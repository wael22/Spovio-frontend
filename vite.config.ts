import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    headers: {
      // Required for FFmpeg.wasm to work (SharedArrayBuffer) while allowing cross-origin media
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    proxy: {
      // Forward all /api requests to Flask backend on port 5000
      // Use 127.0.0.1 explicitly to force IPv4 (localhost resolves to ::1 on Windows)
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Ensure proxied responses have CORP header for COEP compatibility
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
      // Proxy Bunny CDN streams to bypass CORS/COEP restrictions in development
      '/bunny-stream': {
        target: 'https://vz-9b857324-07d.b-cdn.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bunny-stream/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin';
            proxyRes.headers['access-control-allow-origin'] = '*';
          });
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.PNG', 'apple-touch-icon.png', 'icons/icon-192x192.png', 'icons/icon-512x512.png', 'placeholder.svg'],
      manifest: {
        name: 'Spovio - Smart Sports Video',
        short_name: 'Spovio',
        description: 'Enregistrez, analysez et revivez vos matchs de padel avec Spovio.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay', 'fullscreen'],
        background_color: '#090d16',
        theme_color: '#0ea5e9',
        orientation: 'portrait-primary',
        categories: ['sports', 'fitness', 'video', 'analytics'],
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Match Analytics',
            short_name: 'Analytics',
            description: 'Statistiques et analyses de vos matchs',
            url: '/analytics',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Mes Clips',
            short_name: 'Clips',
            description: 'Replays et meilleurs moments',
            url: '/dashboard/my-clips',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Fonctionnalités IA',
            short_name: 'IA Features',
            description: 'Découvrez la détection IA de Spovio',
            url: '/ai-features',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\/.*/, /^\/bunny-stream\/.*/],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 15, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  worker: {
    format: 'es',
  },
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
}));
