import { readFileSync } from 'fs'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import yaml from 'js-yaml'
import { createHighlighter } from 'shiki'

export default function markdownPlugin(options = {}) {
  let highlighter

  return {
    name: 'vite-plugin-markdown',

    // 配置解析完成后初始化高亮器
    async configResolved() {
      highlighter = await createHighlighter({
        themes: ['nord'],
        langs: ['javascript', 'typescript', 'html', 'css', 'json']
      })
    },

    // 转换 Markdown 文件
    async transform(_, id) {
      if (!id.endsWith('.md')) return

      try {
        // 读取 Markdown 文件内容
        const raw = readFileSync(id, 'utf-8')

        // 使用 unified 处理 Markdown
        const tree = await unified()
          .use(remarkParse) // 解析 Markdown
          .use(remarkFrontmatter) // 处理 Frontmatter
          .parse(raw)

        // 转换 Markdown 为 React 组件
        return transformMarkdown(tree, raw, {
          ...options,
          highlighter,
          filePath: id
        })
      } catch (error) {
        this.error(`Markdown 处理失败 [${id}]: ${error.message}`)
        return null
      }
    },

    // 热更新处理
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.md')) {
        // 强制重新加载 Markdown 文件
        return [ctx.file]
      }
    }
  }
}

// 转换 Markdown 为 React 组件
function transformMarkdown(tree, raw, options) {
  const { highlighter, filePath } = options

  // 1. 提取 Frontmatter
  let frontmatter = {}
  visit(tree, 'yaml', (node) => {
    try {
      frontmatter = yaml.load(node.value) || {}
    } catch (e) {
      console.warn(`Frontmatter 解析错误 [${filePath}]:`, e.message)
    }
  })

  // 2. 处理代码块高亮
  visit(tree, 'code', (node) => {
    try {
      if (node.lang) {
        // 使用 shiki 高亮代码
        node.value = highlighter.codeToHtml(node.value, {
          lang: node.lang,
          theme: 'github-dark'
        })
      }
    } catch (e) {
      console.warn(`代码高亮失败 [${filePath}:${node.lang}]:`, e.message)
    }
  })

  // 3. 将 Markdown AST 转换为 HTML
  let htmlContent = ''
  try {
    const processor = unified()
      .use(remarkRehype) // 将 Markdown AST 转换为 HTML AST
      .use(rehypeStringify) // 将 HTML AST 序列化为字符串

    htmlContent = processor.stringify(processor.runSync(tree))
  } catch (e) {
    console.error(`HTML 生成失败 [${filePath}]:`, e)
    htmlContent = `<pre>${e.message}</pre>`
  }

  // 4. 生成 React 组件
  return `
    import React, { useEffect } from 'react';
    import './markdown-styles.css'; // 引入外部样式

    // 创建 React 组件
    const MarkdownComponent = () => {
      // 自动注入的 Frontmatter 数据
      const frontmatter = ${JSON.stringify(frontmatter)};

      ${
        // 开发模式下添加热更新支持
        process.env.NODE_ENV === 'development'
          ? `
          // 热更新处理
          useEffect(() => {
            if (import.meta.hot) {
              import.meta.hot.accept(${JSON.stringify(filePath)}, (newModule) => {
                // 热更新回调 - 实际项目中可以更新状态
                console.log('Markdown 内容已更新');
              });
            }
          }, []);
          `
          : ''
      }

      return (
        <div className="markdown-body">
          {/* 使用 dangerouslySetInnerHTML 渲染 HTML 内容 */}
          <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(htmlContent)} }} />
        </div>
      );
    };

    // 导出组件
    export default MarkdownComponent;
  `
}
