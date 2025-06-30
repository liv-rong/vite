/// <reference types="vite/client" />

declare module '*.svg' {
  const content: any // 声明 SVG 为 any 类型，绕过 TS 检查
  export default content
}
