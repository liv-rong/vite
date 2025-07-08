import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

if (import.meta.hot) {
  // 监听自定义事件
  import.meta.hot.on('my-plugin:greet', (data) => {
    console.log('收到服务端消息：', data.message)
    // 输出：收到服务端消息：你好，我是服务端！
  })
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
