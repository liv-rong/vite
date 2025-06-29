/**
 * @type { import('rollup').RollupOptions }
 */
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import simpleHtml from './simple-html-plugin.js' // 导入你的插件
import filterAssets from './filter-assets-plugin.js'
import manifestPlugin from './manifest-plugin.js'
import versionPlugin from './version-plugin.js'
import alias from './alias.js'
import image from './img.js'
import replace from './replace.js'

export default {
  input: 'src/index.js', // 你的入口文件
  output: {
    dir: 'dist', // 输出目录
    format: 'es', // 输出格式 (es/cjs/umd等)
    sourcemap: true,
    // 确保不与其他配置冲突
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js'
  },

  plugins: [
    // simpleHtml(), // 使用你的HTML插件
    // filterAssets(),
    // manifestPlugin(),
    // versionPlugin(),
    // alias({
    //   entries: [{ find: 'module-a', replacement: './module-a.js' }]
    // })
    // image({
    //   dom: true // 生成DOM元素而非Data URI
    // })
    replace({
      __VERSION__: '"1.0.0"',
      __DEV__: 'false' // 注意这里改为字符串'false'而不是布尔值false
    })
  ]
}
