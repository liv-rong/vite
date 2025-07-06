export default function rollupPluginTest() {
  return {
    name: 'rollup-plugin-test',
    options(opts) {
      // 可以修改或扩展配置
      return {
        ...opts,
        treeshake: true, // 强制开启摇树优化
        external: ['react'] // 添加外部依赖
      }
    },
    buildStart(options) {
      console.log('构建启动！')
      console.log('入口文件:', options.input)
      console.log('输出格式:', options.output?.[0]?.format)
    },
    resolveId(source, importer) {
      // 示例1：将 '@utils' 解析为实际路径
      if (source === '@utils') {
        return path.resolve(__dirname, 'src/utils/index.js')
      }
      // 返回null表示使用默认解析
      return null
    },
    load(id) {
      // 示例1：提供虚拟模块
      if (id === 'virtual-module') {
        return 'export default "这是虚拟模块内容"'
      }
      return null // 其他文件正常加载
    },
    transform(code, id) {
      // 示例1：移除调试代码
      if (process.env.NODE_ENV === 'production') {
        code = code.replace(/console\.log\(.*?\);?/g, '')
      }
      return code // 返回转换后的代码
    },
    moduleParsed(moduleInfo) {
      // 可以在此收集依赖信息用于分析
      console.log(`模块解析完成: ${moduleInfo.id}`)
      console.log('导入的模块:', moduleInfo.importedIds)
      console.log('动态导入的模块:', moduleInfo.dynamicallyImportedIds)
    },
    buildEnd(error) {
      if (error) {
        console.error('构建失败:', error.message)
      } else {
        console.log('构建成功完成!')
        // 可以在这里生成构建报告
      }
    },
    //在 watch 模式下，Rollup 会额外触发两个钩子：
    watchChange(id, change) {
      console.log(`文件变更检测: ${id}`)
      console.log('变更类型:', change.event) // 'create'|'update'|'delete'

      // 可以在这里添加自定义的watch逻辑
    },

    closeWatcher() {
      console.log('监视器关闭')
      // 清理资源
    },
    //dynamicImport 钩子可以用来处理动态导入的模块，
    resolveDynamicImport(specifier, importer) {
      // 示例：处理特殊的动态导入模式
      if (typeof specifier === 'string' && specifier.startsWith('pages/')) {
        return path.resolve(__dirname, `src/${specifier}.js`)
      }

      // 返回null让Rollup继续正常处理
      return null
    },
    //修改输出配置
    outputOptions(options) {
      return {
        ...options,
        sourcemap: true
      }
    },
    //输出开始的时候调用
    renderStart(outputOptions) {
      console.log('开始生成输出:', outputOptions.format)
    },
    //修改chunk的哈希值
    augmentChunkHash(chunkInfo) {
      if (chunkInfo.name === 'main') {
        return Date.now().toString() // 基于时间戳修改哈希
      }
    },
    //转化单个chunk代码
    renderChunk(code, chunkInfo) {
      return `/* ${chunk.fileName} */\n${code}`
    },
    //所有chunks生产后调用 可以修改最终输出
    generateBundle(options, bundle) {
      console.log('生成输出完成:', options.output.file)
      console.log('输出文件:', Object.keys(bundle))
    },
    //文件写入磁盘后调用
    async writeBundle(options, bundle) {
      await sendNotification(`构建完成，生成 ${Object.keys(bundle).length} 个文件`)
    }
  }
}
