import { defineConfig } from 'vite'
import viteHooksLogger from './test'
import Inspect from 'vite-plugin-inspect'
import svgr from './svgr'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, './src/main.tsx') // 改为 main.tsx
    }
  },
  plugins: [
    react(),
    viteHooksLogger(),
    Inspect({
      build: true,
      outputDir: '.vite-inspect'
    }),
    svgr({
      defaultExport: 'component', // 默认作为组件
      svgrOptions: {
        icon: true, // 使SVG可缩放
        svgo: true // 启用SVGO优化
      }
    })
  ]
})
