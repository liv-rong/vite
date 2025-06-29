// html-plugin.js
const fs = require('fs/promises')
const path = require('path')

// 工具函数
const createScript = (src) => `<script type="module" src="${src}"></script>`
const createLink = (src) => `<link rel="stylesheet" href="${src}">`
const generateHTML = (scripts, links) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${links.join('\n')}
</head>
<body>
  <div id="root"></div>
  ${scripts.join('\n')}
</body>
</html>
`

module.exports = () => ({
  name: 'esbuild:html',
  setup(build) {
    build.onEnd(async (buildResult) => {
      if (buildResult.errors.length) return

      const { metafile } = buildResult
      const scripts = []
      const links = []

      // 1. 收集所有JS和CSS产物
      if (metafile) {
        Object.keys(metafile.outputs).forEach((asset) => {
          if (asset.endsWith('.js')) {
            scripts.push(createScript(asset))
          } else if (asset.endsWith('.css')) {
            links.push(createLink(asset))
          }
        })
      }

      // 2. 生成HTML并写入
      const template = generateHTML(scripts, links)
      await fs.writeFile(path.join(process.cwd(), 'index.html'), template)
    })
  }
})
