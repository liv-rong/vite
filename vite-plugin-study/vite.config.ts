import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import virtualFibPlugin from './plugin/virtual'
import vitePluginTest from './plugin/test'
import AutoImport from 'unplugin-auto-import/vite'
import antdResolver from './unplugin-auto-import-antd'
import svgrPlugin from './plugin/svgr'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    virtualFibPlugin(),
    vitePluginTest(),
    AutoImport({
      imports: [
        'react',
        {
          // antd: [
          //   'Button',
          //   'Input'
          // ]
        }
      ],
      resolvers: [
        // antdResolver({
        //   prefix: 'A', // 可选：为所有组件添加 A 前缀
        //   packageName: 'antd' // 可选：默认为 'antd'
        // }),
        {
          type: 'component',
          resolve: (name: string) => {
            console.log('resolve', name)
            const supportedComponents = ['AButton', 'Button', 'AInput', 'ATable'] // 扩展这个列表
            //去除前一个字母A
            const componentName = name.slice(1)
            if (supportedComponents.includes(name)) {
              return {
                from: 'antd',
                name: componentName,
                as: `${name}` // 统一添加A前缀
              }
            }
            return undefined
          }
        }
      ],
      dts: true, // 生成类型声明文件
      eslintrc: {
        enabled: true // 生成 eslint 配置
      }
    }),
    svgrPlugin({
      defaultExport: 'component', // 默认作为组件
      svgrOptions: {
        icon: true, // 使SVG可缩放
        svgo: true // 启用SVGO优化
      }
    })
  ]
})
