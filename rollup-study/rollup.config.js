// import { RollupOptions } from 'rollup'

import rollupPluginAlias from './plugins/alias.js'
import rollupPluginImg from './plugins/img.js'
import rollupPluginReplace from './plugins/replace.js'
import rollupPluginVersion from './plugins/version.js'
import html from './plugins/html.js'

const config = {
  input: 'src/main.js',
  output: {
    // file: 'dist/bundle.js',
    // format: 'es',
    // chunkFileNames: 'chunks/[name]-[hash].js',
    // entryFileNames: '[name].js'
    // 删除 file 配置
    dir: 'dist', // 改为输出目录
    format: 'es',
    chunkFileNames: 'chunks/[name]-[hash].js',
    entryFileNames: '[name].[hash].js' // 包含hash或版本号
  },
  plugins: [
    rollupPluginAlias({
      entries: [
        // 将 import 'module-a' 转换为 import './module-a.js'
        { find: 'module-a', replacement: './module-a.js' }
      ]
    }),
    rollupPluginImg(),
    rollupPluginReplace({
      __VERSION__: '"1.0.0"',
      __DEV__: 'false' // 注意这里改为字符串'false'而不是布尔值false
    }),
    rollupPluginVersion(),
    html()
  ]
}

export default config
