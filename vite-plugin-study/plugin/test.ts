import type { Plugin } from 'vite'
import type { ViteDevServer } from 'vite'

export default function vitePluginTest(): Plugin {
  let devServer: ViteDevServer

  return {
    name: 'vite-plugin-test',
    configureServer(server) {
      devServer = server

      // 监听src目录下的所有文件变化（修正了watcher.add的用法）
      server.watcher.add('src/**/*')

      // 添加API接口
      server.middlewares.use('/api/data', (_, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            data: '测试数据',
            timestamp: Date.now()
          })
        )
      })

      // 请求日志中间件
      server.middlewares.use((req, _, next) => {
        console.log(`[${new Date().toISOString()}] 请求: ${req.originalUrl}`)
        next()
      })

      // 监听文件变化（修正了监听逻辑）
      server.watcher.on('change', (file) => {
        console.log(`文件发生变化: ${file}`)
        if (file.startsWith('src/')) {
          console.log('src目录文件变化，刷新页面')
          server.ws.send({
            type: 'full-reload',
            path: '*'
          })
        }
      })
    },
    transformIndexHtml(html, ctx) {
      const tags: Array<{
        tag: string
        injectTo: 'head' | 'body' | 'head-prepend' | 'body-prepend'
        children?: string
        attrs?: Record<string, string>
      }> = []

      const isDev = !!ctx.server
      if (isDev) {
        tags.push({
          tag: 'script',
          injectTo: 'body-prepend',
          children: 'console.log("开发模式已启动")'
        })
      } else {
        tags.push({
          tag: 'meta',
          injectTo: 'head',
          attrs: { name: 'robots', content: 'index,follow' }
        })
      }

      const newHtml = html.replace(
        '<title>Vite + React + TS</title>',
        '<title>我的定制应用</title>'
      )

      // 返回符合 Vite 要求的类型
      return {
        html: newHtml,
        tags
      }
    },
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.tsx')) {
        console.log('TSX文件修改，触发全量刷新')
        devServer.ws.send({
          type: 'full-reload',
          path: '*'
        })
      }

      // 2. 只处理项目文件，忽略node_modules
      return ctx.modules.filter((module) => !module?.id?.includes('node_modules'))
    }
  }
}
