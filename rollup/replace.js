import MagicString from 'magic-string'

function executeReplacement(code, id, options) {
  const magicString = new MagicString(code)

  Object.entries(options).forEach(([key, value]) => {
    // 确保key是有效的标识符
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(escapedKey, 'g')
    let match

    while ((match = pattern.exec(code))) {
      const start = match.index
      const end = start + match[0].length
      // 确保替换值是字符串，并处理引号情况
      const stringValue =
        typeof value === 'string'
          ? value.startsWith('"') || value.startsWith("'")
            ? value // 已经是带引号的字符串
            : `'${value}'` // 已经是带引号的字符串
          : JSON.stringify(value) // 其他类型转为JSON字符串

      magicString.overwrite(start, end, stringValue)
    }
  })

  return {
    code: magicString.toString(),
    map: magicString.generateMap()
  }
}

export default function replace(options = {}) {
  return {
    name: 'replace',
    transform(code, id) {
      return executeReplacement(code, id, options)
    },
    renderChunk(code, chunk) {
      return executeReplacement(code, chunk.fileName, options)
    }
  }
}
