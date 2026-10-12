import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        // Shown as the "version" in the welcome box, e.g. 2026.10.12.
        __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10).replaceAll('-', '.')),
    },
    base: '/', // Custom domain blueat.me usually implies root
    build: {
        outDir: 'docs',
    }
})
