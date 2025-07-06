// import Logo from './vite.svg'

// import { Button } from 'antd'
// import { fib, memoFib } from 'virtual:fibonacci'
// import routes from 'virtual:routes'

import { Button } from 'ivy-component-library'
// import 'ivy-component-library/dist/index.css'

export default function App() {
  // useEffect(() => {
  //   console.log('hello')
  // }, [])

  return (
    <div>
      <h1>Welcome to Vite!</h1>
      <Button>ashdoaso</Button>
      {/* <AButton>111111</AButton> */}
      <h1>斐波那契数列演示</h1>
      {/* <p>fib(10): {fib(10)}</p>
      <p>memoFib(40): {memoFib(40)}</p> */}
      {/* <pre>{JSON.stringify(routes, null, 2)}</pre>
      {Object.keys(routes).map((path) => (
        <a
          key={path}
          href={path}
          style={{ margin: '0 10px' }}
        >
          {path === '/' ? 'Home' : path.slice(1)}
        </a>
      ))} */}
    </div>
    // <Logo
    //   className="icon"
    //   style={{ color: 'red' }}
    // />
  )
}
