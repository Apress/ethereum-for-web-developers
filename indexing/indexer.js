const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const CONFIRMATIONS = 12;

const PROVIDER = 'https://mainnet.infura.io/v3/21f9184fc9d84c388832f178da5de168';
const DEBUG = true;

// ZEP
const ADDRESS = '0x00fdae9174357424a78afaad98da36fd66dd9e03';
const START_BLOCK = 6563800;
const BATCH_SIZE = 100000;

// DAI
// const ADDRESS = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";
// const START_BLOCK = 4752007;
// const BATCH_SIZE = 100;

// REP
// const ADDRESS = '0x1985365e9f78359a9B6AD760e32412f4a445E862';
// const START_BLOCK = 5926311;
// const BATCH_SIZE = 1000;

const ERC20Artifact = require('openzeppelin-solidity/build/contracts/ERC20.json');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');

module.exports = class ERC20Indexer {
  constructor({ address, startBlock, provider, debug } = {}) {
    this.balances = {};
    this.lastBlockEnqueued = null;
    this.lastBlockProcessed = null;
    this.subscription = null;
    
    this.address = address || ADDRESS;
    this.startBlock = startBlock || START_BLOCK;
    this.lastBlock = this.startBlock;
    this.provider = provider || PROVIDER;
    this.debug = debug || DEBUG;

    this.web3 = new Web3(this.provider);
    this.contract = new this.web3.eth.Contract(ERC20Artifact.abi, this.address);
  }

  getBalances() {
    return Object.assign({}, this.balances);
  }

  getLastBlock() {
    return lastBlockProcessed;
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
    this.lastBlockEnqueued = endBlock;
    
    for (let fromBlock = startBlock; fromBlock <= endBlock; fromBlock += BATCH_SIZE) {
      const toBlock = Math.min(fromBlock + BATCH_SIZE - 1, endBlock);
      this.log(` Batch ${fromBlock}-${toBlock}`);
      const events = await this.contract.getPastEvents('Transfer', {
        fromBlock, toBlock
      });    
      events.forEach((e) => this.reduceEvent(e));
      this.lastBlockProcessed = toBlock;
    }
  }

  async processNewBlocks() {
    const currentBlock = await this.web3.eth.getBlockNumber() - CONFIRMATIONS;
    if (!this.lastBlock || currentBlock >= this.lastBlock) {
      await this.processBlocks(this.contract, this.lastBlock, current)
      this.lastBlock = currentBlock + 1;
    }
  }

  start() {
    this.timeout = setTimeout(async () => {
      await this.processNewBlocks()
      this.start();
    }, 1000);
  }

  // start() {
  //   // Load historic data so far
  //   // const currentBlock = await this.web3.eth.getBlockNumber() - CONFIRMATIONS;
  //   // await this.processBlocks(contract, this.startBlock, currentBlock);

  //   // Monitor new blocks and process them
  //   this.pollNewBlocks();
  // }

  stop() {
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