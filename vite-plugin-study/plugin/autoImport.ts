import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { parse } from '@babel/parser'
import * as t from '@babel/types'
import _generate from '@babel/generator' // 用于将 AST 生成回 JavaScript 代码字符串。
import _traverse from '@babel/traverse' // 用于遍历 AST，允许对 AST 进行深度优先搜索。

const generate = (_generate as any)?.default || _generate
const traverse = (_traverse as any)?.default || _traverse

interface AutoImportOptions {
  dir?: string
  extensions?: string[]
  exclude?: RegExp
  include?: RegExp
  dts?: boolean | string
  reactHooks?: boolean | string[] // 新增：控制是否自动导入React Hooks
}

const defaultOptions: Required<AutoImportOptions> = {
  dir: 'src/components',
  extensions: ['.tsx', '.jsx'],
  exclude: /(\.test\.|\.stories\.|index\.)/,
  include: /\.(tsx|jsx)$/,
  dts: true,
  reactHooks: true // 默认开启React Hooks自动导入
}

const COMPONENTS_VIRTUAL_MODULE = 'virtual:auto-import-components'
const RESOLVED_COMPONENTS_VIRTUAL_MODULE = `\0${COMPONENTS_VIRTUAL_MODULE}`

// React常用Hooks列表
const DEFAULT_REACT_HOOKS = [
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useLayoutEffect',
  'useDebugValue'
]

export default function autoImportComponents(options?: AutoImportOptions): Plugin {
  const opts = { ...defaultOptions, ...options }
  let rootDir = ''
  const componentMap: Record<string, string> = {}
  const hookMap: Record<string, string> = {} // 存储Hook映射
  let dtsPath = ''

  // 初始化React Hooks
  const initReactHooks = () => {
    if (opts.reactHooks) {
      const hooks = Array.isArray(opts.reactHooks) ? opts.reactHooks : DEFAULT_REACT_HOOKS

      hooks.forEach((hook) => {
        hookMap[hook] = 'react'
      })
    }
  }

  // 扫描组件目录
  const scanComponents = (dir: string): Record<string, string> => {
    const map: Record<string, string> = {}
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️ Components directory not found: ${dir}`)
      return map
    }

    const walk = (currentDir: string) => {
      //读取指定目录 currentDir 中的文件和子目录 withFileTypes 表示返回的结果将包含文件类型信息
      const files = fs.readdirSync(currentDir, { withFileTypes: true })

      // console.log(`🔍 Scanning components in ${currentDir}`)

      for (const file of files) {
        // filePath 的值为 /Users/rwr/repo/vite/vite-plugin-study/src/components/MyInput.tsx
        const filePath = path.join(currentDir, file.name)

        // console.log(`🔍 Scanning filePath in ${filePath}`)

        if (file.isDirectory()) {
          walk(filePath)
          continue
        }

        if (!opts.extensions.some((ext) => file.name.endsWith(ext))) continue
        if (opts.exclude.test(file.name)) continue
        if (!opts.include.test(file.name)) continue

        const fileName = path.basename(file.name, path.extname(file.name))
        // index 开头 和数字开头条过
        // 如果文件名不符合大写字母开头且只包含字母、数字和连字符
        if (
          fileName === 'index' ||
          !/^[A-Z][a-zA-Z0-9\-]*$/.test(fileName) ||
          /^\d/.test(fileName)
        ) {
          continue
        }

        //components/MyInput 计算相对路径
        const relativePath = path
          .relative(path.join(rootDir, 'src'), filePath)
          .replace(/\\/g, '/')
          .replace(/\.(tsx|jsx)$/, '')

        // console.log(`🔍 Scanning fileName in ${path.join(rootDir, 'src')}`)

        // console.log(`🔍 Scanning relativePath in ${relativePath}`)

        //检查 map 对象中是否已经存在该 fileName。如果不存在，表示这是一个新组件。
        if (!map[fileName]) {
          map[fileName] = `@/${relativePath}`
        } else {
          console.warn(`⚠️ Duplicate component name "${fileName}" found in ${filePath}`)
        }
      }
    }

    walk(dir)
    return map
  }

  // 生成虚拟模块内容（包含组件和Hooks）
  const generateVirtualModule = () => {
    const imports: string[] = []
    const exports: string[] = []

    // 添加组件导入
    for (const [name, importPath] of Object.entries(componentMap)) {
      imports.push(`import ${name} from '${importPath}';`)
      exports.push(`export { ${name} };`)
    }

    // 添加React Hooks导入
    for (const [hook, source] of Object.entries(hookMap)) {
      imports.push(`import { ${hook} } from '${source}';`)
      exports.push(`export { ${hook} };`)
    }

    return `${imports.join('\n')}\n\n${exports.join('\n')}\n`
  }

  // 生成类型声明文件（包含组件和Hooks）
  const generateDtsFile = () => {
    if (!opts.dts) return

    dtsPath =
      typeof opts.dts === 'string'
        ? path.join(rootDir, opts.dts)
        : path.join(rootDir, 'src/auto-imports.d.ts')

    const dir = path.dirname(dtsPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const content = `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by vite-plugin-auto-import-components
export {}
declare global {
  // 组件类型
${Object.entries(componentMap)
  .map(([name, importPath]) => `  const ${name}: typeof import('${importPath}')['default']`)
  .join('\n')}

  // React Hooks类型
${Object.entries(hookMap)
  .map(([hook, source]) => `  const ${hook}: typeof import('${source}')['${hook}']`)
  .join('\n')}
}
`

    try {
      fs.writeFileSync(dtsPath, content, 'utf-8')
      // console.log(`✅ Generated auto-import types: ${dtsPath}`)
    } catch (e: any) {
      console.error(`❌ Failed to write type definitions: ${e.message}`)
    }
  }

  // 更新映射
  const updateMaps = () => {
    const targetDir = path.join(rootDir, opts.dir)
    Object.assign(componentMap, scanComponents(targetDir))
    generateDtsFile()
  }

  // 初始化
  initReactHooks()

  return {
    name: 'vite-plugin-auto-import-components',
    enforce: 'pre', // 在Vite核心插件之前执行

    resolveId(id) {
      if (id === COMPONENTS_VIRTUAL_MODULE) {
        return RESOLVED_COMPONENTS_VIRTUAL_MODULE
      }
    },

    load(id) {
      if (id === RESOLVED_COMPONENTS_VIRTUAL_MODULE) {
        return generateVirtualModule()
      }
    },
    //Vite配置解析完成后
    configResolved(config) {
      rootDir = config.root // 获取项目根目录
      updateMaps() // 初始扫描组件
    },

    transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id)) return
      // 如果已经导入了虚拟模块则跳过
      if (code.includes(COMPONENTS_VIRTUAL_MODULE)) return

      try {
        // 解析代码为AST
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
          errorRecovery: true
        })
        // 收集使用的组件
        const usedImports = new Set<string>()

        // 遍历AST查找组件使用
        traverse(ast, {
          // 检测组件使用
          JSXIdentifier(path: any) {
            // 忽略闭合标签（如 </div> 中的 div）
            if (path.parent.type === 'JSXClosingElement') return
            // 获取标识符名称（如 "MyComponent"）
            const name = path.node.name
            // 检查是否是PascalCase组件
            if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) return
            // 检查是否在组件映射中
            if (!componentMap[name]) return
            // 检查组件是否已在作用域中定义
            let currentScope = path.scope
            let isDefined = false

            // 从当前作用域开始向上遍历所有父作用域
            while (currentScope) {
              // 如果发现该名称已在作用域中绑定（已导入或定义）
              if (currentScope.bindings[name]) {
                isDefined = true
                break
              }
              currentScope = currentScope.parent // 向上查找父作用域
            }

            if (isDefined) return

            usedImports.add(name)
          },

          // 检测Hook使用
          Identifier(path: any) {
            const name = path.node.name // 获取标识符名称（如 "useState"）
            if (!hookMap[name]) return

            // 确保是函数调用形式（如 useHook()，而不是 useHook = ...）
            // 是函数调用   当前节点是调用对象
            if (path.parent.type === 'CallExpression' && path.parent.callee === path.node) {
              let currentScope = path.scope //  获取当前标识符所在的作用域
              let isDefined = false //  初始化标记：假设变量未定义

              // 从当前作用域开始向上遍历作用域链
              while (currentScope) {
                // 3. 只要存在父作用域就继续检查
                if (currentScope.bindings[name]) {
                  // 4. 检查当前作用域是否有该变量的绑定
                  isDefined = true // 5. 如果找到，标记为已定义
                  break // 6. 跳出循环（不需要继续查找）
                }
                currentScope = currentScope.parent // 7. 移动到父作用域继续检查
              }
              if (!isDefined) {
                usedImports.add(name)
              }
            }
          }
        })
        // 如果有使用的组件，添加导入语句
        if (usedImports.size > 0) {
          // 创建导入声明AST节点
          const importStatement = t.importDeclaration(
            //  创建导入说明符（import { name }）
            Array.from(usedImports).map((name) =>
              t.importSpecifier(t.identifier(name), t.identifier(name))
            ),
            // 导入来源（虚拟模块）
            t.stringLiteral(COMPONENTS_VIRTUAL_MODULE)
          )
          // 将导入语句添加到AST开头
          ast.program.body.unshift(importStatement)
          //  生成新代码
          const result = generate(ast, { retainLines: true }, code)

          return {
            code: result.code,
            map: result.map
          }
        }
      } catch (e: any) {
        console.error(`❌ Error processing ${id}:`, e.message)
      }

      return null
    },
    // 热更新处理 - 组件文件变化时重新扫描
    handleHotUpdate({ file }) {
      const ext = path.extname(file)
      // 检查是否是组件文件
      if (opts.extensions.includes(ext)) {
        // 检查是否符合包含/排除规则
        if (file.includes(opts.dir)) {
          //排除在外的文件
          if (!opts.exclude.test(file) && opts.include.test(file)) {
            updateMaps()
          }
        }
      }
    },

    buildEnd() {
      generateDtsFile()
    }
  }
}
