import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        // Shown in the welcome box's top border; bump "version" in package.json to change it.
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    base: '/', // Custom domain blueat.me usually implies root
    build: {
        outDir: 'docs',
    }
})
