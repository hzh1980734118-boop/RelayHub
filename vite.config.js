import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' 

export default defineConfig({
  plugins: [vue()],
  base: '/RelayHub/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
})