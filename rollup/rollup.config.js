/**
 * @type { import('rollup').RollupOptions }
 */
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const buildOptions = {
  input: {
    index: 'src/index.js'
  },
  output: [
    { plugins: [terser()] },
    {
      dir: 'dist/es',
      format: 'esm'
    },
    {
      dir: 'dist/cjs',
      format: 'cjs'
    }
  ],
  // 通过 plugins 参数添加插件
  plugins: [resolve(), commonjs()]
}

export default buildOptions
