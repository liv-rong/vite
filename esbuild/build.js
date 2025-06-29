// // 引入 esbuild 的 build 方法，用于执行构建任务
// const { build } = require('esbuild')

// // 定义异步构建函数
// async function runBuild() {
//   // 调用 esbuild 的 build 方法进行构建，返回一个 Promise
//   const result = await build({
//     // ---- 基本配置 ----
//     // 设置当前工作目录为项目根目录
//     // process.cwd() 返回 Node.js 进程的当前工作目录
//     absWorkingDir: process.cwd(),

//     // 指定入口文件，可以是数组形式指定多个入口
//     entryPoints: ['./src/index.jsx'],

//     // 指定输出目录，打包后的文件将放在这个目录下
//     outdir: 'dist',

//     // ---- 打包配置 ----
//     // 是否打包所有依赖，true 表示将依赖项内联到输出文件中
//     bundle: true,

//     // 输出模块格式，可选:
//     // 'esm' - ES 模块
//     // 'cjs' - CommonJS
//     // 'iife' - 立即执行函数
//     format: 'esm',

//     // 排除不需要打包的依赖项（保持外部引用）
//     // 这里为空数组表示打包所有依赖
//     external: [],

//     // 是否启用代码分割（当 format 为 'esm' 时可用）
//     // true 表示将共享代码拆分为单独的文件
//     splitting: true,

//     // ---- 输出配置 ----
//     // 是否生成 sourcemap 文件，true 表示生成
//     // 有助于调试，但会增加构建时间
//     sourcemap: true,

//     // 是否生成元信息文件，true 表示生成
//     // 包含输入输出文件信息，可用于分析构建结果
//     metafile: true,

//     // 是否压缩代码，false 表示不压缩
//     // 生产环境建议设为 true
//     minify: false,

//     // 是否将输出写入磁盘，true 表示写入
//     // 设为 false 则只返回结果不生成文件
//     write: true,

//     // ---- 加载器配置 ----
//     // 指定不同文件类型的处理方式
//     loader: {
//       '.png': 'base64' // 将 png 图片转为 base64 内联
//       // 其他常见 loader:
//       // '.js'/'jsx': 'jsx' - 处理 JSX 文件
//       // '.ts'/'tsx': 'tsx' - 处理 TypeScript 文件
//       // '.json': 'json' - 处理 JSON 文件
//       // '.txt': 'text' - 作为纯文本处理
//     }
//   })

//   // 打印构建结果
//   // 如果 metafile 为 true，result.metafile 包含构建详情
//   console.log(result)
// }

// // 执行构建函数，并捕获可能的错误
// runBuild().catch((e) => {
//   console.error('构建失败:', e)
//   process.exit(1) // 如果出错，以错误码退出进程
// })

const { context } = require('esbuild')

async function openTeaShop() {
  try {
    // 1. 布置工作台
    const workshop = await context({
      entryPoints: ['./src/index.jsx'], // 原料入口
      outdir: 'dist', // 成品区
      bundle: true, // 打包材料
      format: 'esm', // 包装标准
      sourcemap: true, // 制作手册
      loader: { '.png': 'file' } // 处理珍珠图片
    })

    // 2. 开门营业
    const shop = await workshop.serve({
      port: 3000, // 窗口号3000
      servedir: 'dist', // 成品展示区
      host: 'localhost' // 本店地址
    })

    console.log(`👉 快来喝奶茶：http://${shop.host}:${shop.port}`)

    // 3. 设置打烊闹钟
    process.on('SIGINT', async () => {
      await workshop.dispose()
      console.log('🛑 今天奶茶卖完啦！')
      process.exit(0)
    })
  } catch (error) {
    console.error('开店失败：', error)
    process.exit(1)
  }
}

// 开张！
openTeaShop()
