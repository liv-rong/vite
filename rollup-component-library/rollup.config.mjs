import postcss from 'rollup-plugin-postcss'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import dts from 'rollup-plugin-dts' // 新增类型声明插件

/** @type {import("rollup").RollupOptions[]} */
export default [
  // 主构建配置
  {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    output: [
      {
        file: 'dist/esm.js',
        format: 'esm'
      },
      {
        file: 'dist/cjs.js',
        format: 'cjs'
      },
      {
        file: 'dist/umd.js',
        name: 'ivy',
        format: 'umd',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: false, // 禁用 Rollup 的类型生成
        allowImportingTsExtensions: false
      }),
      postcss({
        extract: 'index.css'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      })
    ]
  },

  // 新增: 类型声明文件构建配置
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [
      dts() // 专门生成 .d.ts 文件
    ]
  }
]
