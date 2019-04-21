const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const CONFIRMATIONS = 12;

const ERC20Artifact = require('openzeppelin-solidity/build/contracts/ERC20.json');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');

module.exports = class ERC20Indexer {
  constructor({ address, startBlock, provider, batchSize, debug, confirmations } = {}) {
    this.balances = {};
    this.lastBlockNumber = startBlock || 0;
    this.subscription = null;
    
    this.address = address;
    this.startBlock = startBlock;
    this.batchSize = batchSize || 100;
    this.provider = provider;
    this.debug = debug;
    this.confirmations = confirmations || CONFIRMATIONS;

    this.web3 = new Web3(this.provider);
    this.contract = new this.web3.eth.Contract(ERC20Artifact.abi, this.address);
  }

  getBalances() {
    return Object.assign({}, this.balances);
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
    const currentBlock = await this.web3.eth.getBlockNumber() - this.confirmations;
    if (!this.lastBlockNumber || currentBlock >= this.lastBlockNumber) {
      await this.processBlocks(this.lastBlockNumber, currentBlock)
      this.lastBlockNumber = currentBlock + 1;
    }
  }

  start() {
    this.timeout = setTimeout(async () => {
      await this.processNewBlocks()
      this.start();
    }, 1000);
  }

  async stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  log() {
    if (this.debug) {
      console.error(...arguments);
    }
  }
}