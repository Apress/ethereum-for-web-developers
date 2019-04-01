import React, { Component } from 'react';
import './App.css';
import ERC721 from './components/ERC721';
import { getDeployed } from './contracts/ERC721';
import { hasProvider, getAccount } from './eth/network';

class App extends Component {
  state = {
    contract: null,
    sender: null
  }

async componentDidMount() {
  if (hasProvider()) {
    const contract = await getDeployed();
    const sender = await getAccount();
    this.setState({ contract, sender });

    window.ethereum.on('accountsChanged', async (accounts) => {
      this.setState({ sender: accounts[0] });
    })
  }
}

render() {
  const { contract, sender } = this.state;

  return (
    <div className="App">
      { (hasProvider() && contract && sender) 
        ? <ERC721 contract={contract} owner={sender} key={sender} />
        : <div>Please enable Metamask and reload</div>
      }
    </div>
  );
}
}

export default App;
