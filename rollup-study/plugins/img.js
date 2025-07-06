import { readFileSync } from 'fs'
import { extname } from 'path'

// 支持的图片类型及其MIME类型
const DEFAULT_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
}

// 默认配置
const DEFAULT_OPTIONS = {
  dom: false,
  exclude: undefined,
  include: undefined,
  mimeTypes: DEFAULT_MIME_TYPES
}

export default function rollupPluginImg(opts = {}) {
  const options = { ...DEFAULT_OPTIONS, ...opts }

  return {
    name: 'rollup-plugin-image',

    load(id) {
      try {
        console.log('id', id)
        // 1. 检查文件扩展名是否匹配 ext .svg
        const ext = extname(id)
        console.log('ext', ext) //ext .svg

        const mime = options.mimeTypes[ext]

        console.log('mime', mime) //mime image/svg+xml

        // 如果不是图片类型，返回 null
        if (!mime) return null

        // 2. 检查包含/排除规则
        if (options.exclude && options.exclude.test(id)) return null
        if (options.include && !options.include.test(id)) return null

        // 3. 读取文件内容
        const isSvg = mime === 'image/svg+xml'
        const format = isSvg ? 'utf-8' : 'base64'
        const source = readFileSync(id, format).replace(/[\r\n]+/gm, '')

        // 4. 生成Data URI
        const dataUri = `data:${mime};${format},${source}`

        // 5. 根据配置生成不同的导出代码
        const code = options.dom ? generateDomCode(dataUri) : generateConstCode(dataUri)

        return code.trim()
      } catch (error) {
        // 6. 错误处理
        this.warn(`Failed to load image ${id}: ${error.message}`)
        return null
      }
    }
  }
}

// 生成DOM元素的代码
function generateDomCode(dataUri) {
  return `
    var img = new Image();
    img.src = '${dataUri}';
    export default img;
  `
}

// 生成常量导出的代码
function generateConstCode(dataUri) {
  return `export default '${dataUri}';`
}
