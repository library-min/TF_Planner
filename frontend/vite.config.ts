// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 경로 상대 처리
  build: {
    outDir: 'docs', // 👈 dist → docs로 바꾸기
  },
});
