import { fib, memoFib } from 'virtual:fibonacci'

import Svg from './assets/react.svg'

import { Button } from 'ivy-component-library'
// import { MyButton } from './components'
// import 'ivy-component-library/dist/index.css'

// import MyButton from '@/components/MyButton'

function App() {
  return (
    <>
      <div>
        <h1>斐波那契数列演示weewqwqweweewsdsdfs</h1>
        <h1>斐波那契数列演示</h1>
        <p>fib(10): {fib(10)}</p>
        <p>memoFib(40): {memoFib(40)}</p>
        {/* <AButton>111111</AButton>
        <AInput></AInput> */}
        <Button variate={'ghost'}>asdasd</Button>
        <MyButton onClick={() => alert('Button clicked!')}>Click Me</MyButton>
        <Svg></Svg>
        <MyInput />
        {/* <Button type="primary">按钮</Button> */}
      </div>
    </>
  )
}

export default App
