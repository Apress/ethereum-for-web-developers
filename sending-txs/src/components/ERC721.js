import React, { Component } from 'react';
import './ERC721.css';
import './Token.js';
import { getBlockNumber, getWeb3 } from '../eth/network';
import BigNumber from 'bignumber.js';
import { getGasPrice } from '../eth/gasPrice';
import { areAddressesEqual } from '../eth/address';
import Token from './Token.js';
import Mint from './Mint';

const CONFIRMATIONS = 6;

class ERC721 extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      tokens: [], 
      loading: true,
      newBlocksSub: null
    };

    this.mint = this.mint.bind(this);
    this.canMint = this.canMint.bind(this);
  }

  async getTokensAtBlock(blockNumber) {
    const { contract, owner } = this.props;
    const balance = parseInt(await contract.methods.balanceOf(owner).call({}, blockNumber));
    return await Promise.all(Array.from({ length: balance }, (_x, index) => (
      contract.methods.tokenOfOwnerByIndex(owner, index).call({}, blockNumber)
    )));
  }

  async canMint(id) {
    const { contract } = this.props;
    const exists = await contract.methods.exists(id).call();
    return !exists;
  }

  async mint(id) {
    const { contract, owner } = this.props;
    const from = owner;
    const value = new BigNumber(id).shiftedBy(12).toString(10);
    const gas = await contract.methods.mint(owner, id).estimateGas({ value, from });
    const gasPrice = await getGasPrice();

    contract.methods.mint(owner, id).send({ value, gas, gasPrice, from })
      .on('transactionHash', () => {
        this.addToken(id);
      })
      .on('receipt', () => {
        this.confirmToken(id, 0);
      })
      .on('confirmation', (number) => {
        this.confirmToken(id, number);
      })
      .on('error', (error) => {
        this.failToken(id, error)
      });
  }

  addToken(id) {
    this.setState(state => ({
      ...state,
      tokens: [ ...state.tokens, { id }]
    }));
  }

  confirmToken(id, confirmations) {
    this.setState(state => ({
      ...state,
      tokens: state.tokens.map(token => (
        token.id === id ? { id, confirmed: confirmations >= CONFIRMATIONS } : token
      ))
    }));
  }

  failToken(id, error) {
    this.setState(state => ({
      ...state,
      tokens: state.tokens.map(token => (
        token.id === id ? { id, error } : token
      ))
    }));
  }

  subscribeUnconfirmedTokens(unconfirmedTokenIds) {
    if (unconfirmedTokenIds.length === 0) return;
    const { contract, owner } = this.props;
    this.newBlocksSub = getWeb3().eth.subscribe('newBlockHeaders', (err, { number }) => {
      unconfirmedTokenIds.forEach(async (id) => {
        const confirmedOwner = await contract.methods.ownerOf(id).call({}, (number - CONFIRMATIONS).toString()).catch(() => null);
        if (areAddressesEqual(confirmedOwner, owner)) {
          this.confirmToken(id, CONFIRMATIONS);
          unconfirmedTokenIds = unconfirmedTokenIds.filter(i => id !== i);
          if (unconfirmedTokenIds.length ===0) this.newBlocksSub.unsubscribe();
        }
      });
    });
  }

  async componentDidMount() {
    const currentBlock = await getBlockNumber();
    const confirmedTokenIds = await this.getTokensAtBlock(currentBlock - CONFIRMATIONS).catch(() => []);
    const latestTokenIds = await this.getTokensAtBlock(currentBlock);
    let unconfirmedTokenIds = latestTokenIds.filter(id => !confirmedTokenIds.includes(id));
    const tokens = confirmedTokenIds.map(id => ({ id, confirmed: true }))
      .concat(unconfirmedTokenIds.map(id => ({ id, confirmed: false })));

    this.setState({ tokens, loading: false });
    this.subscribeUnconfirmedTokens(unconfirmedTokenIds);
  }

  render() {
    const { tokens, loading } = this.state;
    const { contract } = this.props;
    if (loading) return "Loading";

    return (
      <div className="ERC721">
        <h1>
          Collectible Numbers
        </h1>
        <div className="ERC721-address">Address: { contract.options.address }</div>
        <div className="ERC721-tokens">
          { tokens.map(token => (
            <Token key={token.id.toString()} token={token} />
          ))}
        </div>
        <Mint canMint={this.canMint} mint={this.mint} />
      </div>
    );
  }
}

export default ERC721;