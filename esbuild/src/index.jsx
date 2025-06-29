import Server from 'react-dom/server'
import Greet from './Greet'

console.log(Server.renderToString(<Greet />))
