export default function filterAssets() {
  return {
    name: 'filter-assets',
    generateBundle(_, bundle) {
      // 删除所有.map文件
      console.log(bundle)
      for (const fileName in bundle) {
        console.log(fileName)
        if (fileName.endsWith('.map')) {
          delete bundle[fileName]
        }
      }
    }
  }
}
