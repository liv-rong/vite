import type { Resolver } from 'unplugin-auto-import/types'

import { antdBuiltInComponents } from './preset'
import type { AntdResolverOptions } from './types'
import { getAntdComponentsMap } from './utils'

export const antdResolver = (options: AntdResolverOptions = {}): Resolver => {
  console.log(options, 'options')
  const { prefix, packageName: from = 'antd' } = options
  const antdComponentsMap = getAntdComponentsMap(prefix)
  console.log(antdComponentsMap, 'antdComponentsMap')
  const res: Resolver = {
    type: 'component',
    resolve: (originName: string) => {
      console.log('originName', originName)
      if (!prefix) {
        if (antdBuiltInComponents.includes(originName)) {
          const test = {
            from,
            name: originName
          }
          console.log('antdBuiltInComponents', test)
          return {
            from,
            name: originName
          }
        }
      } else {
        // 如果设定前缀，则重命名引入
        const name = antdComponentsMap.get(originName)
        if (name) {
          return {
            from,
            name,
            as: originName
          }
        }
      }
      return undefined
    }
  }
  console.log('11111111111111111')
  console.log(res.resolve, 'res')
  return res
}
