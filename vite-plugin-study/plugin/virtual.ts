import type { Plugin } from 'vite'

// 定义虚拟模块ID
const virtualModuleId = 'virtual:fibonacci'
const resolvedVirtualModuleId = '\0' + virtualModuleId

export default function virtualFibPlugin(): Plugin {
  return {
    name: 'vite-plugin-virtual-fib',

    // 解析虚拟模块ID
    resolveId(id) {
      console.log(id, 'resolveId')
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },

    // 加载虚拟模块内容
    load(id) {
      console.log(id, 'load')
      if (id === resolvedVirtualModuleId) {
        return `
          // 斐波那契数列实现
          export function fib(n) {
            return n <= 1 ? n : fib(n - 1) + fib(n - 2)
          }

          // 记忆化版本
          export function memoFib(n, memo = {}) {
            if (n in memo) return memo[n]
            if (n <= 1) return n
            memo[n] = memoFib(n - 1, memo) + memoFib(n - 2, memo)
            return memo[n]
          }
        `
      }
    }
  }
}
