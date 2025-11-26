import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/embed.js',
      name: 'FabCityWidget',
      formats: ['umd'],
      fileName: (format) => `fab-city-widget.${format}.js`
    },
    rollupOptions: {
      external: [],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {}
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://fab-city-express-1.onrender.com',
        changeOrigin: true,
        
      }
    },
    allowedHosts: true
  }
})
