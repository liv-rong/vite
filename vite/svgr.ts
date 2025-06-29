// plugins/svgr.ts
import type { Plugin } from 'vite'
import fs from 'node:fs/promises'
import { transform } from '@svgr/core'
import { transform as esbuildTransform } from 'esbuild'

interface SvgrOptions {
  defaultExport?: 'url' | 'component'
  svgrOptions?: Record<string, any>
}

export default function svgrPlugin(options: SvgrOptions = {}): Plugin {
  const { defaultExport = 'component', svgrOptions = {} } = options

  return {
    name: 'vite-plugin-svgr',
    async transform(_, id) {
      if (!id.endsWith('.svg')) return

      try {
        const svg = await fs.readFile(id, 'utf-8')

        // 1. 使用更安全的SVGR配置
        const componentCode = await transform(
          svg,
          {
            ...svgrOptions,
            plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
            typescript: true,
            jsxRuntime: 'automatic',
            exportType: 'named',
            template: ({ componentName, jsx }, { tpl }) => {
              return tpl`
                const ${componentName} = (props) => ${jsx};
                export { ${componentName} };
              `
            }
          },
          { componentName: 'ReactComponent' }
        )

        // 2. 清理和标准化代码
        let jsCode = componentCode
          .replace(/^\/\*.*?\*\/\s*/gms, '') // 移除注释
          .replace(/\n+/g, '\n') // 压缩空行
          .trim()

        // 3. 处理导出逻辑
        if (defaultExport === 'url') {
          jsCode = `
            ${jsCode}
            export default ${JSON.stringify(id)};
          `.trim()
        } else {
          jsCode = `
            ${jsCode}
            export default ReactComponent;
          `.trim()
        }

        // 4. 使用更严格的esbuild配置
        const result = await esbuildTransform(jsCode, {
          loader: 'jsx',
          jsx: 'automatic',
          sourcefile: id,
          format: 'esm',
          target: 'es2020',
          logLevel: 'silent'
        })

        return {
          code: result.code,
          map: result.map || null
        }
      } catch (error) {
        console.error(`SVG转换失败 [${id}]:`, error)
        // 安全回退：返回原始SVG路径
        return {
          code: `export default ${JSON.stringify(id)};`,
          map: null
        }
      }
    }
  }
}
