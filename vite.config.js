import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Especifica la carpeta de salida para la construcción de producción
    outDir: 'build',
    emptyOutDir: true, // Limpia el directorio de salida antes de construir
    rollupOptions: {
      // Opciones adicionales aquí si es necesario
    }
  }
});
