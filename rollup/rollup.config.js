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
    versionPlugin()
  ]
}
