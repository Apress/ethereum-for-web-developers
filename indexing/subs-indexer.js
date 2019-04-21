const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ERC20Artifact = require('openzeppelin-solidity/build/contracts/ERC20.json');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const last = require('lodash.last');

module.exports = class ERC20Indexer {
  constructor({ address, startBlock, provider, batchSize, debug, confirmations } = {}) {
    this.balances = {};
    this.subscription = null;
    
    this.address = address;
    this.startBlock = startBlock;
    this.batchSize = batchSize || 100;
    this.provider = provider;
    this.debug = debug;

    this.web3 = new Web3(this.provider);
    this.contract = new this.web3.eth.Contract(ERC20Artifact.abi, this.address);
  }

  getBalances() {
    return Object.assign({}, this.balances);
  }

  async getBlockHash(number) {
    const { hash } = await this.web3.eth.getBlock(number);
    return hash;
  }

  async reduceEvent(event) {
    const { from, to, value } = event.returnValues;
    this.log(`  ${event.transactionHash}#${event.logIndex}: ${from} => ${to} (${value.toString()})`);

    if (from !== ZERO_ADDRESS) {
      this.balances[from] = this.balances[from] 
        ? this.balances[from].minus(value)
        : BigNumber(value).negated();
    }
    
    if (to !== ZERO_ADDRESS) {
      this.balances[to] = this.balances[to] 
        ? this.balances[to].plus(value) 
        : BigNumber(value);
    }
  }

  async processBlocks(startBlock, endBlock) {
    this.log(`Blocks ${startBlock}-${endBlock}`);
    
    for (let fromBlock = startBlock; fromBlock <= endBlock; fromBlock += this.batchSize) {
      const toBlock = Math.min(fromBlock + this.batchSize - 1, endBlock);
      this.log(` Batch ${fromBlock}-${toBlock}`);
      const events = await this.contract.getPastEvents('Transfer', {
        fromBlock, toBlock
      });    
      events.forEach((e) => this.reduceEvent(e));
    }
  }

  async processNewBlocks() {
    // If already subscribed, we just allow some  time to process new blocks
    if (this.subscription) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 300);
      })
    }

    // Process all past blocks
    const currentBlock = await this.web3.eth.getBlockNumber();
    await this.processBlocks(this.startBlock, currentBlock);

    // Subscribe to new ones
    this.subscription = this.contract.events.Transfer({ fromBlock: currentBlock + 1 })
      .on('data', e => this.reduceEvent(e))
      .on('changed', e => this.undoTransfer(e.returnValues))
      .on('error', err => console.error("Error in subscription", err));
  }

  start() {
    return this.processNewBlocks();
  }

  async stop() {
    if (this.subscription) {
      await this.subscription.unsubscribe();
    }
  }

  log() {
    if (this.debug) {
      console.error(...arguments);
    }
  }
}