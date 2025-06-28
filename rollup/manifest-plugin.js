export default function manifestPlugin() {
  return {
    name: 'manifest',
    async generateBundle(_, bundle) {
      // 1. 创建空manifest对象
      const manifest = {}

      // 2. 遍历所有打包文件
      Object.keys(bundle).forEach((fileName) => {
        const file = bundle[fileName]

        // 3. 只处理chunk和asset类型文件
        if (file.type === 'chunk' || file.type === 'asset') {
          manifest[fileName] = {
            size: file.code?.length || file.source?.length || 0, // 计算文件大小
            type: file.type // 记录文件类型
          }
        }
      })

      // 4. 生成manifest文件
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2) // 美化输出
      })
    }
  }
}
