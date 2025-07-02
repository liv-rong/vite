import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

// 生成路由配置
function generateRoutes() {
  const pagesDir = path.join(process.cwd(), 'src/pages')
  console.log(pagesDir) ///Users/rwr/repo/vite/vite/src/pages
  const routes: Record<string, string> = {}

  // 递归扫描 pages 目录
  function scanDirectory(dir: string, basePath = '') {
    const files = fs.readdirSync(dir)

    console.log(files)

    files.forEach((file) => {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      console.log(fullPath, stat, 'fullPathfullPath')

      if (stat.isDirectory()) {
        // 处理子目录
        console.log(path.join(basePath, file), 'path.join(basePath, file)')
        scanDirectory(fullPath, path.join(basePath, file))
      } else if (file.endsWith('.tsx') || file.endsWith('.vue')) {
        // 处理路由文件
        const routePath = path
          .join(basePath, file)
          .replace(/\.(tsx|vue)$/, '')
          .replace(/\/index$/, '') // 去掉index
          .replace(/\[(.*?)\]/g, ':$1') // [id] => :id
        const routeName = `/${routePath}`
        routes[routeName] = `./src/pages/${path.join(basePath, file)}`
      }
    })
  }

  scanDirectory(pagesDir)
  return routes
}

export default function fileRoutePlugin(): Plugin {
  return {
    name: 'vite-plugin-file-route',
    configureServer(server) {
      //    监听文件变化
      server.watcher.on('change', (file) => {
        if (file.includes('pages/')) {
          server.ws.send({
            type: 'full-reload', //全加载
            path: '*'
          })
        }
      })
    },
    resolveId(id) {
      if (id === 'virtual:routes') {
        // 转换为虚拟模块ID（Vite约定加\0前缀）
        return '\0virtual:routes'
      }
    },
    load(id) {
      if (id === '\0virtual:routes') {
        return `export default ${JSON.stringify(generateRoutes(), null, 2)}`
      }
    }
  }
}
