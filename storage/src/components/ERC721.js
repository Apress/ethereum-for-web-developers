import React, { Component } from 'react';
import { createHash } from 'crypto';
import './ERC721.css';
import './Token.js';
import { getBlockNumber, getWeb3 } from '../eth/network';
import BigNumber from 'bignumber.js';
import { getGasPrice } from '../eth/gasPrice';
import { areAddressesEqual } from '../eth/address';
import { save as saveLocal } from '../storage/local';
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

  async mint({ value: id, title, description }) {
    const { contract, owner } = this.props;
    const from = owner;
    const data = JSON.stringify({ id, title, description });
    const url = await saveLocal(id, data);
    const value = new BigNumber(id).shiftedBy(12).toString(10);

    const gas = await contract.methods.mint(owner, id, url).estimateGas({ value, from });
    const gasPrice = await getGasPrice();

    contract.methods.mint(owner, id, url).send({ value, gas, gasPrice, from })
      .on('transactionHash', () => {
        this.addToken(id, { title, description });
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

  addToken(id, data) {
    this.setState(state => ({
      ...state,
      tokens: [ ...state.tokens, { id, ...data }]
    }));
  }

  confirmToken(id, confirmations) {
    this.setState(state => ({
      ...state,
      tokens: state.tokens.map(token => (
        token.id === id ? { ...token, confirmed: confirmations >= CONFIRMATIONS } : token
      ))
    }));
  }

  failToken(id, error) {
    this.setState(state => ({
      ...state,
      tokens: state.tokens.map(token => (
        token.id === id ? { ...token, error } : token
      ))
    }));
  }

  setTokenData(id, data) {
    this.setState(state => ({
      ...state,
      tokens: state.tokens.map(token => (
        token.id === id ? { ...token, ...data } : token
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

  loadTokensData(tokens) {
    tokens.forEach(async ({ id }) => {
      const url = await this.props.contract.methods.tokenURI(id).call();
      const data = await fetch(url).then(res => res.json()).catch(() => "");
      const hash = createHash('sha256').update(JSON.stringify(data)).digest('hex');
      const path = new URL(url).pathname.slice(1);
      if (path === hash) this.setTokenData(id, data);
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
    this.loadTokensData(tokens);
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