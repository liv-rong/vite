// ✅ 正确写法：使用命名导入
import { watch } from 'rollup'

const watcher = watch({
  input: './src/index.js',
  output: [
    {
      dir: 'dist/es',
      format: 'esm'
    },
    {
      dir: 'dist/cjs',
      format: 'cjs'
    }
  ],
  watch: {
    exclude: ['node_modules/**'],
    include: ['src/**']
  }
})

// 监听事件（保持不变）
watcher.on('restart', () => {
  console.log('重新构建...')
})

watcher.on('change', (id) => {
  console.log('发生变动的模块id: ', id)
})

watcher.on('event', (e) => {
  if (e.code === 'BUNDLE_END') {
    console.log('打包信息:', e)
  }
})
