import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactNativeWeb from 'vite-plugin-react-native-web'
import path from 'path'

/**
 * Raven-Os Web Configuration (Vite)
 * Universal Build with strict dependency resolution to prevent React Hook collisions.
 */

export default defineConfig({
  root: '.', // Ensuring the web app's root is fixed
  plugins: [
    react(),
    reactNativeWeb(),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      'zustand': path.resolve(__dirname, '../../node_modules/zustand'),
    },
    // ──────────────────────────────────────────────────────────────
    // RAVEN-OS: Platform-Aware File Resolution (Flutter-style)
    // Vite checks .web.tsx FIRST → falls back to shared .tsx
    // A dev can fix a web-only bug in RavenCard.web.tsx and the
    // mobile build never notices. Surgical, isolated, zero coupling.
    // ──────────────────────────────────────────────────────────────
    extensions: [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js',
    ],
  },
  optimizeDeps: {
    // Ensuring these aren't pre-bundled in a way that splits context
    include: ['react', 'react-dom', 'zustand'],
  },
  // Building from the monorepo root requires explicit filesystem access
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
