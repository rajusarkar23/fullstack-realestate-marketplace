import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://fullstack-realestate-marketplace.onrender.com',
        secure: false,
      },
    },
  },

  plugins: [react()],
});