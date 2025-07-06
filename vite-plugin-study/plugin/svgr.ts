import type { Plugin } from 'vite'
import fs from 'node:fs/promises'
import { transform } from '@svgr/core'
import { transform as esbuildTransform } from 'esbuild'

interface SvgrOptions {
  defaultExport?: 'url' | 'component' // 导出类型：URL字符串 或 React组件
  svgrOptions?: Record<string, any> // 自定义SVGR配置
}

export default function svgrPlugin(options: SvgrOptions = {}): Plugin {
  // 设置默认值：默认导出为组件，空SVGR配置
  const { defaultExport = 'component', svgrOptions = {} } = options

  return {
    name: 'vite-plugin-svgr',

    // transform 钩子：转换文件内容
    async transform(_, id) {
      // 只处理 .svg 文件
      if (!id.endsWith('.svg')) return

      try {
        // 1. 读取 SVG 文件内容
        const svg = await fs.readFile(id, 'utf-8')

        // 2. 使用 SVGR 将 SVG 转换为 React 组件代码
        const componentCode = await transform(
          svg, // SVG 原始内容
          {
            ...svgrOptions, // 用户自定义配置

            // 核心插件配置开始
            plugins: [
              '@svgr/plugin-jsx', // 转换 SVG 为 JSX
              '@svgr/plugin-prettier' // 格式化生成的代码
            ],

            // 其他重要配置
            typescript: true, // 生成 TS 兼容代码
            jsxRuntime: 'automatic', // 使用新版 JSX 运行时
            exportType: 'named', // 使用命名导出

            // 自定义模板：控制组件输出结构
            template: ({ componentName, jsx }, { tpl }) => {
              return tpl`
                const ${componentName} = (props) => ${jsx};
                export { ${componentName} };
              `
            }
          },
          { componentName: 'ReactComponent' } // 设置组件名称
        )

        // 3. 清理生成的代码
        let jsCode = componentCode
          .replace(/^\/\*.*?\*\/\s*/gms, '') // 移除注释
          .replace(/\n+/g, '\n') // 压缩空行
          .trim()

        // 4. 处理导出逻辑
        if (defaultExport === 'url') {
          // URL 模式：默认导出 SVG 路径
          jsCode = `
            ${jsCode}
            export default ${JSON.stringify(id)};
          `.trim()
        } else {
          // 组件模式：默认导出 React 组件
          jsCode = `
            ${jsCode}
            export default ReactComponent;
          `.trim()
        }

        // 5. 使用 esbuild 转换 JSX 为浏览器可执行代码
        const result = await esbuildTransform(jsCode, {
          loader: 'jsx', // 指定为 JSX 类型
          jsx: 'automatic', // 使用新版 JSX 转换
          sourcefile: id, // 源文件路径（用于 sourcemap）
          format: 'esm', // 输出 ESM 格式
          target: 'es2020', // 目标 ES 版本
          logLevel: 'silent' // 不输出日志
        })

        // 6. 返回转换后的代码
        return {
          code: result.code,
          map: result.map || null
        }
      } catch (error) {
        // 错误处理：回退到原始 SVG 路径导出
        console.error(`SVG转换失败 [${id}]:`, error)
        return {
          code: `export default ${JSON.stringify(id)};`,
          map: null
        }
      }
    }
  }
}
