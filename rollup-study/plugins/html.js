// simple-html-plugin.js
export default function rollupPluginHtml() {
  return {
    name: 'rollup-plugin-html',
    async generateBundle(outputOptions, bundle) {
      console.log(bundle, 'bundle')
      // 1. 筛选需要注入的JS文件
      const jsFiles = Object.keys(bundle).filter((name) => name.endsWith('.js'))

      // 2. 生成HTML内容
      let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <div id="app"></div>`

      // 3. 注入JS脚本
      jsFiles.forEach((file) => {
        html += `\n  <script src="${file}"></script>`
      })

      html += '\n</body>\n</html>'

      // 4. 输出HTML文件
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html
      })
    }
  }
}
