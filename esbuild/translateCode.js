const { transform } = require('esbuild')

async function translateCode() {
  // 准备要翻译的代码
  const tsCode = `const isNull = (str: string): boolean => str.length > 0;`

  // 请翻译官工作（异步方式）
  const result = await transform(tsCode, {
    loader: 'tsx', // 告诉翻译官这是 TS 代码
    sourcemap: true // 生成翻译对照表
  })

  console.log('翻译结果:', result)
  /* 输出:
  {
    code: 'const isNull = (str) => str.length > 0;\n',
    map: '{"version":3,...}',
    warnings: []
  }
  */
}

translateCode()
