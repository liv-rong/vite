import MagicString from 'magic-string'
//高效操作字符串并生成 SourceMap 的 JS 库

//id -当前文件路径
//options - 替换配置
//code - 原始代码
//magicString - MagicString 对象
function executeReplacement(code, id, options) {
  const magicString = new MagicString(code)

  // 2. 遍历所有需要替换的键值对
  Object.entries(options).forEach(([key, value]) => {
    // 确保key是有效的标识符
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(escapedKey, 'g')
    console.log(pattern, 'pattern')
    let match
    // 3. 查找所有匹配项
    while ((match = pattern.exec(code))) {
      const start = match.index
      const end = start + match[0].length
      console.log(start, end, match, '匹配项')
      // 确保替换值是字符串，并处理引号情况
      const stringValue =
        typeof value === 'string'
          ? value.startsWith('"') || value.startsWith("'")
            ? value // 已经是带引号的字符串
            : `'${value}'` // 已经是带引号的字符串
          : JSON.stringify(value) // 其他类型转为JSON字符串
      //执行替换
      magicString.overwrite(start, end, stringValue)
    }
  })

  return {
    code: magicString.toString(),
    map: magicString.generateMap() //用于生成 source map  JSON提供原始源代码和转换后代码之间的映射关系
  }
}
//两个钩子都执行	原始模块中的代码可能被其他插件修改 最终组合后的代码最好也执行一次
export default function rollupPluginReplace(options = {}) {
  return {
    name: 'rollup-plugin-replace',
    transform(code, id) {
      return executeReplacement(code, id, options)
    },
    renderChunk(code, chunk) {
      return executeReplacement(code, chunk.fileName, options)
    }
  }
}
