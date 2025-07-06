export default function alias(options = {}) {
  // 规范化 entries 配置
  const entries = Array.isArray(options.entries) ? options.entries : options ? [options] : []
  console.log(entries) //[ { find: 'module-a', replacement: './module-a.js' } ]
  return {
    name: 'rollup-plugin-alias',
    resolveId(importee, importer, resolveOptions) {
      // 1. 检查是否是入口模块（没有 importer）
      console.log('正在解析:', importee)
      console.log('正在解析:', importer)
      console.log('正在解析:', resolveOptions)
      if (!importer) {
        return null
      }

      // 2. 查找匹配的别名规则
      const matchedEntry = entries.find((entry) => {
        // 支持字符串精确匹配或正则表达式匹配
        if (typeof entry.find === 'string') {
          return entry.find === importee
        } else if (entry.find instanceof RegExp) {
          return entry.find.test(importee)
        }
        return false
      })
      console.log(matchedEntry)
      if (!matchedEntry) {
        return null
      }
      console.log(matchedEntry)

      // 3. 执行路径替换
      let updatedId
      if (typeof matchedEntry.replacement === 'function') {
        updatedId = matchedEntry.replacement(importee)
      } else if (matchedEntry.find instanceof RegExp) {
        updatedId = importee.replace(matchedEntry.find, matchedEntry.replacement)
      } else {
        updatedId = matchedEntry.replacement
      }

      // 4. 规范化路径（处理 ./ 和 ../ 等）
      updatedId = normalizePath(updatedId)

      // 5. 让其他插件继续处理新路径
      return this.resolve(
        updatedId, // 替换后的新路径
        importer, // 引用者的模块路径
        Object.assign({ skipSelf: true }, resolveOptions) // 合并配置
      ).then((resolved) => {
        return resolved || { id: updatedId } // 返回解析结果或默认值
      })
    }
  }
}

// 辅助函数：规范化路径
function normalizePath(path) {
  // 处理 Windows 反斜杠
  path = path.replace(/\\/g, '/')

  // 处理相对路径
  if (path.startsWith('./') || path.startsWith('../')) {
    return path
  }

  // 确保非相对路径以 ./ 开头
  return `./${path.replace(/^\.?\//, '')}`
}
