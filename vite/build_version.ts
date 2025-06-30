import dayjs from 'dayjs'
import { writeFileSync } from 'fs'
import path from 'path'

export const build_version = (outPath: string = 'dist') => {
  let buildStartTime = '' // 用于保存打包开始时间
  return {
    name: 'build_version',
    // 记录打包开始时间
    buildStart() {
      buildStartTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    // 记录打包结束时间并生成文件
    closeBundle() {
      const data = {
        buildStartTime, // 打包开始时间
        buildEndTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 打包结束时间
        useTime: dayjs().diff(buildStartTime, 'second') // 打包消耗时间 秒
      }
      // 将根目录与 outPath 结合并指定文件名
      const outputPath = path.join(process.cwd(), outPath, 'version.txt')
      // 写入文件
      writeFileSync(outputPath, JSON.stringify(data, null, 2)) // 使JSON更加易读
      console.log(`Version file generated at ${outputPath}`)
    }
  }
}
