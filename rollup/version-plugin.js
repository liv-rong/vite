export default function versionPlugin() {
  const version = new Date().toISOString().replace(/[:.]/g, '-')

  return {
    name: 'version',
    // 设置为最后执行的插件
    enforce: 'post',
    generateBundle(outputOptions, bundle) {
      const jsFiles = Object.keys(bundle).filter((fileName) => {
        const file = bundle[fileName]
        // 更全面的JS文件判断
        return (
          (file.type === 'chunk' && fileName.endsWith('.js')) ||
          (file.fileName && file.fileName.endsWith('.js'))
        )
      })

      // 处理所有JS文件
      jsFiles.forEach((fileName) => {
        const file = bundle[fileName]
        const newName = file.fileName
          ? file.fileName.replace('.js', `-${version}.js`)
          : fileName.replace('.js', `-${version}.js`)

        // 更新文件名引用
        if (file.fileName) file.fileName = newName
        if (file.facadeModuleId) file.facadeModuleId = newName

        // 在bundle中创建新条目
        bundle[newName] = file
        delete bundle[fileName]
      })

      // 生成版本信息文件
      this.emitFile({
        type: 'asset',
        fileName: 'version.txt',
        source: `Build Version: ${version}\nBuild Time: ${new Date()}\nFiles: ${jsFiles.join(', ')}`
      })
    }
  }
}
