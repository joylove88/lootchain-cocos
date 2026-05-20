import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 7460,
  },
  preview: {
    host: '0.0.0.0',
    port: 7461,
  },
});
