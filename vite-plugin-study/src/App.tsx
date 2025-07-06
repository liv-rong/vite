import { fib, memoFib } from 'virtual:fibonacci'

import Svg from './assets/react.svg'

import { Button } from 'ivy-component-library'

// import 'ivy-component-library/dist/index.css'

function App() {
  return (
    <>
      <div>
        <h1>斐波那契数列演示weewweewsdsdfs</h1>
        <h1>斐波那契数列演示</h1>
        <p>fib(10): {fib(10)}</p>
        <p>memoFib(40): {memoFib(40)}</p>
        <AButton>111111</AButton>
        <AInput></AInput>
        <Button variate={'ghost'}>asdasd</Button>
        <Svg></Svg>
        {/* <Button type="primary">按钮</Button> */}
      </div>
    </>
  )
}

export default App
