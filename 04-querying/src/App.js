import React, { Component } from 'react';
import './App.css';
import ERC20 from './components/ERC20';
import ERC20Contract from './contracts/ERC20';
import { getWeb3 } from './eth/network';

const ERC20_ADDRESS = "0x1985365e9f78359a9B6AD760e32412f4a445E862";

class App extends Component {
  state = {
    erc20: null,
    isMainnet: null,
    error: null,
    loading: true
  }

  async componentDidMount() {
    const web3 = getWeb3();
    await this.checkNetwork(web3);
    await this.retrieveContract(web3);
    this.setState({ loading: false });
  }

  async checkNetwork(web3) {
    try {
      const networkId = await web3.eth.net.getId();
      const isMainnet = (networkId === 1);
      this.setState({ isMainnet });
    } catch (error) {
      console.error(error);
      this.setState({ error: `Error connecting to network: ${error.message}` })
    }
  }

  async retrieveContract(web3) {
    if (!this.state.isMainnet) return;
    try {
      const erc20 = await ERC20Contract(web3, ERC20_ADDRESS);
      this.setState({ erc20 });
    } catch (error) {
      console.error(error);
      this.setState({ error: `Error retrieving contract: ${error.message}` })
    }
  }

  render() {
    return (
      <div className="App">
        { this.getAppContent() }
      </div>
    );
  }

  getAppContent() {
    const { loading, error, isMainnet, erc20 } = this.state;

    if (error) {
      return (<div>{error}</div>);
    } else if (loading) {
      return (<div>Connecting to network...</div>);
    } else if (!isMainnet) {
      return (<div>Please connect to Mainnet</div>);
    } else {
      return (<ERC20 contract={erc20} />);
    }
  }
}

export default App;
