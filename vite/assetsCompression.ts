// // 虽然我用的是ESM的语法，但是实际上我的产物是CommonJS的规范
// import Sharp from 'sharp'

// function assetsCompression(params: { cwd: string }): PluginOption {
//   // 我的构建路径的cwd是一个业务路径，所以需要由外界传递路径的上下文
//   const { cwd } = params
//   return {
//     name: 'vite-plugin-assets-compression',
//     apply: 'build',
//     enforce: 'pre',
//     async buildStart() {
//       logger.success(
//         '=========================================准备开始进行资源压缩========================================='
//       )
//       return new Promise(async (resolve) => {
//         const matchPattern = cwd + '/**/*.{jpe?g,png,gif,webp}'
//         // 使用glob匹配到项目中所有的图片文件
//         const matchPass = glob.sync(matchPattern)
//         for (const imgFile of matchPass) {
//           const imgFileRelativePath = imgFile.replace(cwd + '/', '')
//           const originalFileInfo = statSync(imgFile)
//           const originSize = Math.floor(originalFileInfo.size / 1024)
//           // 小于10KB的图就不压缩了
//           if (originSize <= 10) {
//             continue
//           }
//           // 跳过已经压缩过的图片，我们项目中是以文件路径中出现minify这个单词作为依据的
//           if (/minify\//.test(imgFile)) {
//             logger.success(imgFileRelativePath + '已压缩，跳过压缩')
//             continue
//           }
//           // 压缩过程中如果出现错误，不要打断后续的构建流程
//           try {
//             const extName = extname(imgFile)
//             const outputFile = imgFile.replace(extName, '') + '__compressed' + extName
//             await Sharp(imgFile)
//               .png({
//                 quality: 60,
//                 compressionLevel: 9,
//                 progressive: true
//               })
//               .webp({
//                 quality: 70,
//                 effort: 6
//               })
//               .jpeg({
//                 mozjpeg: true,
//                 quality: 60,
//                 progressive: true
//               })
//               .gif({
//                 effort: 10,
//                 progressive: true
//               })
//               .toFile(outputFile)
//             const compressedFileInfo = statSync(outputFile)
//             if (originalFileInfo.size > compressedFileInfo.size) {
//               logger.info(
//                 '图片' +
//                   imgFileRelativePath +
//                   '压缩成功，原始文件大小:' +
//                   originSize +
//                   'KB，压缩文件大小:' +
//                   Math.floor(compressedFileInfo.size / 1024) +
//                   'KB'
//               )
//               // 删除原文件
//               unlinkSync(imgFile)
//               // 将压缩之后的文件重命名为新文件
//               renameSync(outputFile, outputFile.replace('__compressed', ''))
//             } else {
//               logger.success('图片' + imgFileRelativePath + '已压缩，无需重复压缩')
//               // 文件压缩之后较大，取消压缩之后的文件
//               unlinkSync(outputFile)
//             }
//           } catch (exp) {
//             logger.error('压缩出错，跳过压缩图片：' + imgFileRelativePath)
//           }
//         }
//         logger.success(
//           '=========================================资源压缩完成========================================='
//         )
//         resolve()
//       })
//     }
//   }
// }
