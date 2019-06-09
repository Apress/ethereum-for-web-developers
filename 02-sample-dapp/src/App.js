import React, { Component } from 'react';
import './App.css';
import Counter from './components/Counter';
import { getDeployed } from './contracts/Counter';
import { hasProvider } from './eth/network';

class App extends Component {
  state = {
    counter: null
  }

  async componentDidMount() {
    if (hasProvider()) {
      const counter = await getDeployed();
      this.setState({ counter });
    }
  }

  render() {
    const { counter } = this.state;

    return (
      <div className="App">
        { (hasProvider() && counter) 
          ? <Counter contract={counter} />
          : <div>Please enable Metamask and reload</div>
        }
      </div>
    );
  }
}

export default App;
