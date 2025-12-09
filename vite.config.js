import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/', // Custom domain blueat.me usually implies root
    build: {
        outDir: 'docs',
    }
})
