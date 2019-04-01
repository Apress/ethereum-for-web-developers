import React, { Component } from 'react';
import { formatValue } from '../utils/format';
import Transfers from './Transfers';
import './ERC20.css';

class ERC20 extends Component {
  state = {
    name: null,
    symbol: null,
    decimals: null,
    totalSupply: null
  }

  async componentDidMount() {
    const { contract } = this.props;
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
      contract.methods.totalSupply().call(),
    ]);

    this.setState({ name, symbol, decimals, totalSupply });
  }

  render() {
    if (!this.state.totalSupply) return "Loading...";
    const { name, totalSupply, decimals, symbol } = this.state;
    const { contract } = this.props;

    return (
      <div className="ERC20">
        <h1>{name} Token</h1>
        <div>
          Total supply of {formatValue(totalSupply, decimals)} {symbol}
        </div>
        <div>
          <h2>Transfers</h2>
          <Transfers contract={contract} decimals={decimals} symbol={symbol} />
        </div>
      </div>
    );
  }
}

export default ERC20;