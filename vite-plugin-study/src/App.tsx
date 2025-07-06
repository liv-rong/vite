import { fib, memoFib } from 'virtual:fibonacci'

import Svg from './assets/react.svg'

function App() {
  return (
    <>
      <div>
        <h1>斐波那契数列演示</h1>
        <h1>斐波那契数列演示</h1>
        <p>fib(10): {fib(10)}</p>
        <p>memoFib(40): {memoFib(40)}</p>
        <AButton>111111</AButton>
        <AInput></AInput>
        <Svg></Svg>
        {/* <Button type="primary">按钮</Button> */}
      </div>
    </>
  )
}

export default App
