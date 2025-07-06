// version-plugin.js
export default function rollupPluginVersion() {
  const version = Date.now() // 使用时间戳作为版本号

  return {
    name: 'rollup-plugin-version',
    generateBundle(_, bundle) {
      const manifest = {}

      // 1. 给JS文件添加版本号并收集文件信息
      Object.entries(bundle).forEach(([fileName, file]) => {
        // 只处理JS文件
        if (fileName.endsWith('.js')) {
          // 创建带版本号的新文件名
          const newName = fileName.replace('.js', `.${version}.js`)

          // 添加新版本文件到bundle
          bundle[newName] = file

          // 从bundle中移除旧文件
          delete bundle[fileName]

          // 更新manifest使用新文件名
          fileName = newName
        }

        // 记录文件信息到manifest
        manifest[fileName] = {
          size: file.code?.length || file.source?.length || 0,
          type: file.type,
          fileName: fileName
        }
      })

      // 2. 生成版本记录文件
      this.emitFile({
        type: 'asset',
        fileName: 'version.txt',
        source: `版本号: ${version}\n生成时间: ${new Date().toISOString()}`
      })

      // 3. 生成manifest文件
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(
          {
            version,
            buildTime: new Date().toISOString(),
            files: manifest
          },
          null,
          2
        )
      })
    }
  }
}
