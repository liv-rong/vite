import { defineConfig } from 'vite'
import viteHooksLogger from './test'
import Inspect from 'vite-plugin-inspect'
import svgr from './svgr'
import path from 'path'
import react from '@vitejs/plugin-react'
import antdResolver from './src/unplugin-auto-import-antd'
import AutoImport from 'unplugin-auto-import/vite'
import virtual from './virtual'
import fileRoutePlugin from './fileRoutePlugin'
// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, './src/main.tsx') // 改为 main.tsx
    }
  },
  plugins: [
    react(),
    // viteHooksLogger(),
    // Inspect({
    //   build: true,
    //   outputDir: '.vite-inspect'
    // }),
    // svgr({
    //   defaultExport: 'component', // 默认作为组件
    //   svgrOptions: {
    //     icon: true, // 使SVG可缩放
    //     svgo: true // 启用SVGO优化
    //   }
    // }),
    // AutoImport({
    //   imports: [
    //     'react', // 自动导入 react 相关函数
    //     {
    //       antd: [
    //         // 按需导入 antd 组件（如 Button, Input 等）
    //         'Button',
    //         'Input'
    //         // 或者直接导入所有 antd 组件（不推荐，可能影响构建体积）
    //         // '*'
    //       ]
    //     }
    //   ],

    //   resolvers: [
    //     antdResolver({
    //       prefix: 'A', // 可选：为所有组件添加 A 前缀
    //       packageName: 'antd' // 可选：默认为 'antd'
    //     })
    //   ],
    //   dts: true, // 生成类型声明文件
    //   eslintrc: {
    //     enabled: true // 生成 eslint 配置
    //   }
    // }),
    // virtual(),
    // fileRoutePlugin()，
    {
      name: 'my-communication-plugin',
      configureServer(server) {
        // 当WebSocket连接建立时
        server.ws.on('connection', () => {
          // 向所有客户端广播消息
          server.ws.send('my-plugin:greeting', {
            message: '你好，客户端！',
            timestamp: Date.now()
          })
        })
      }
    }
  ]
})
