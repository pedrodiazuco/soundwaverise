import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: path.resolve(__dirname, '../backend/public'), // Ajusta la ruta según la estructura de tu proyecto
    emptyOutDir: true, // Limpia el directorio de salida antes de construir
  }
});
