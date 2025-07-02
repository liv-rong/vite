// src/virtual.d.ts
declare module 'virtual:fibonacci' {
  export function fib(n: number): number
  export function memoFib(n: number, memo?: Record<number, number>): number
}

declare module 'virtual:env' {
  const env: {
    MODE: string
    BASE_URL: string
    PROD: boolean
    DEV: boolean
  }
  export default env
}
