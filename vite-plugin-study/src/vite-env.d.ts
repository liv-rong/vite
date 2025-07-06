/// <reference types="vite/client" />

declare module '*.svg' {
  const content: any // 声明 SVG 为 any 类型，绕过 TS 检查
  export default content
}

declare module 'virtual:routes' {
  const routes: Record<
    string,
    {
      path: string
      component: string
      filePath: string
    }
  >
  export default routes
}
