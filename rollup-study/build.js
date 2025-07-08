import { rollup } from 'rollup'

// 常用 inputOptions 配置
const inputOptions = {
  input: './src/main.js',
  external: [],
  plugins: []
}

const outputOptionsList = [
  // 常用 outputOptions 配置
  {
    dir: 'dist/es',
    entryFileNames: `[name].[hash].js`, //  入口模块的输出文件名
    chunkFileNames: 'chunk-[hash].js', // 非入口模块(如动态 import)的输出文件名
    assetFileNames: 'assets/[name]-[hash][extname]',
    format: 'es',
    sourcemap: true,
    globals: {
      lodash: '_'
    }
  }
  // 省略其它的输出配置
]

async function build() {
  let bundle
  let buildFailed = false
  try {
    // 1. 调用 rollup.rollup 生成 bundle 对象
    bundle = await rollup(inputOptions)
    console.log('我是构建对象', bundle)
    for (const outputOptions of outputOptionsList) {
      // 2. 拿到 bundle 对象，根据每一份输出配置，调用 generate 和 write 方法分别生成和写入产物
      const { output } = await bundle.generate(outputOptions)
      console.log(output, 'outpot')
      await bundle.write(outputOptions)
    }
  } catch (error) {
    buildFailed = true
    console.error(error)
  }
  if (bundle) {
    console.log(bundle)
    // 最后调用 bundle.close 方法结束打包
    await bundle.close()
  }
  process.exit(buildFailed ? 1 : 0)
}

build()
