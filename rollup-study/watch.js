// watch.js

import { watch } from 'rollup'

// 配置监控系统
const watcher = watch({
  // 基本打包配置（和rollup.config.js一样）
  input: './src/main.js', // 主入口文件位置
  output: [
    {
      dir: 'dist/es', // （ES模块格式）
      format: 'esm'
    },
    {
      dir: 'dist/cjs', //（CommonJS格式）
      format: 'cjs'
    }
  ],
  // 监控专用配置
  watch: {
    exclude: ['node_modules/**'], // 不监控文件（node_modules）
    include: ['src/**'] // 只监控文件（src目录）
  }
})

// 设置监控警报（事件监听）
watcher.on('restart', () => {
  console.log('🔄 检测到文件变化，正在重建...')
})

watcher.on('change', (id) => {
  console.log(`📁 发现变动的文件: ${id}`)
})

watcher.on('event', (e) => {
  if (e.code === 'BUNDLE_START') {
    console.log('👨‍🍳 开始构建新版本...')
  }
  if (e.code === 'BUNDLE_END') {
    console.log(`✅ 构建完成！耗时 ${e.duration}ms`)
    console.log('产出位置:', e.output)
  }
  if (e.code === 'ERROR') {
    console.error('🔥 构建失败！', e.error)
  }
})

process.on('SIGINT', () => {
  watcher.close()
  process.exit(0)
})
