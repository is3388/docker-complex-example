import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import OtherPage from './OtherPage'
import Fib from './Fib'

function App() {
  return (
    <Router>
      <Switch>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Fib Calculator</h1>
          <Link to='/'>Home</Link>
          <Link to='/otherpage'>Other Page</Link>
          </header>  
        <div>
          <Route path='/' component={Fib} exact/>
          <Route path='/otherpage' component={OtherPage} />
        </div>
      
    </div>
    </Switch>
    </Router>
  );
}

export default App;
