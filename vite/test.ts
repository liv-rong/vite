import type { PluginOption } from 'vite'

export default function viteHooksLogger(): PluginOption {
  let finalConfig: any

  return {
    name: 'vite-hooks-logger',

    // === 配置阶段 ===
    config(config, { command, mode }) {
      console.log('1. [config] 配置初始化', {
        command,
        mode,
        userConfig: config
      })
      return {
        server: { port: 5173 },
        build: { minify: false }
      }
    },

    configResolved(config) {
      console.log('2. [configResolved] 配置解析完成')
      finalConfig = config
    },

    // === 选项处理 ===
    options(options) {
      console.log('3. [options] Rollup 选项处理')
      return {
        ...options,
        treeshake: 'recommended'
      }
    },

    // === 开发服务器 ===
    configureServer(server) {
      console.log('4. [configureServer] 开发服务器配置')

      server.middlewares.use('/plugin-route', (req, res) => {
        res.end('Hello from plugin!')
      })

      return () => {
        console.log('4.1 [configureServer返回函数] 内部中间件之后执行')
      }
    },

    // === 构建开始 ===
    buildStart() {
      console.log('5. [buildStart] 构建开始')
    },

    // === 请求处理阶段 ===
    resolveId(source, importer, options) {
      if (/\.(jsx?|tsx?)$/.test(source)) {
        console.log(`6. [resolveId] 解析模块: ${source}`)
      }
      return null
    },

    load(id) {
      console.log(`7. [load] 加载模块: ${id}`)
      return null
    },

    transform(code, id) {
      if (id.endsWith('.jsx') || id.endsWith('.tsx')) {
        console.log(`8. [transform] 转换模块: ${id}`)
      }
      return code
    },

    transformIndexHtml(html, ctx) {
      console.log('9. [transformIndexHtml] 处理HTML', {
        path: ctx.path,
        filename: ctx.filename
      })

      return {
        html,
        tags: [
          {
            tag: 'script',
            injectTo: 'head',
            attrs: { type: 'module', src: '/src/main.ts' }
          }
        ]
      }
    },

    // === 热更新 ===
    handleHotUpdate(ctx) {
      console.log('10. [handleHotUpdate] 热更新触发', {
        file: ctx.file,
        timestamp: ctx.timestamp,
        modules: ctx.modules.length
      })
      return ctx.modules
    },

    // === 构建结束 ===
    buildEnd(err?: Error) {
      console.log('11. [buildEnd] 构建结束', {
        error: err?.message || '无错误'
      })
    },

    closeBundle() {
      console.log('12. [closeBundle] 打包完成')
    }
  }
}
