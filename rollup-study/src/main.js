import { add } from './add.js'
import { moduleA } from './module-a'
// import logoSvg from '../public/icon.svg'
// import logo from '../public/logo.jpg'

console.log(add(2, 3))

console.log(moduleA)
// console.log(logoSvg)
// console.log(logo)
if (__DEV__) {
  console.log('Version:', __VERSION__)
}

export function formatDate(date, pattern = 'YYYY-MM-DD') {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return pattern.replace('YYYY', year).replace('MM', month).replace('DD', day)
}

// 时间格式化函数
export function formatTime(date, pattern = 'HH:mm:ss') {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return pattern.replace('HH', hours).replace('mm', minutes).replace('ss', seconds)
}
