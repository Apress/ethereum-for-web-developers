const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const ERC20Artifact = require('openzeppelin-solidity/build/contracts/ERC20.json');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const last = require('lodash.last');

module.exports = class ERC20Indexer {
  constructor({ address, startBlock, provider, batchSize, debug, confirmations } = {}) {
    this.balances = {};
    this.eventsBlocks = [];
    this.lastBlockNumber = startBlock || 0;
    this.lastBlockHash = null;
    this.subscription = null;
    
    this.address = address;
    this.startBlock = startBlock;
    this.batchSize = batchSize || 100;
    this.provider = provider;
    this.debug = debug;
    this.confirmations = confirmations || 12;

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
    this.saveEvent(event);

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

  async saveEvent(event) {
    if (!last(this.eventsBlocks) || last(this.eventsBlocks).hash !== event.blockHash) {
      this.eventsBlocks.push({ 
        number: event.blockNumber, 
        hash: event.blockHash, 
        transfers: [] 
      });
    }
    
    last(this.eventsBlocks).transfers.push(event.returnValues);
  }

  async processBlocks(startBlock, endBlock) {
    this.log(`Blocks ${startBlock}-${endBlock}`);

    for (let fromBlock = startBlock; fromBlock <= endBlock; fromBlock += this.batchSize) {
      const toBlock = Math.min(fromBlock + this.batchSize - 1, endBlock);
      this.log(` Batch ${fromBlock}-${toBlock}`);
      const events = await this.contract.getPastEvents('Transfer', { fromBlock, toBlock });
      events.forEach((e) => this.reduceEvent(e));
    }
  }

  undoTransfer(transfer) {
    const { from, to, value } = transfer;
    this.log(`  Undoing ${from} => ${to} (${value.toString()})`);

    if (from !== ZERO_ADDRESS) {
      this.balances[from] = this.balances[from].plus(value);
    }
    
    if (to !== ZERO_ADDRESS) {
      this.balances[to] = this.balances[to].minus(value);
    }
  }

  async undoBlocks() {
    while (this.eventsBlocks.length > 0) {
      const lastEventsBlock = last(this.eventsBlocks);
      const hash = await this.getBlockHash(lastEventsBlock.number);
      if (lastEventsBlock.hash === hash) return lastEventsBlock;
      
      this.eventsBlocks.pop();
      lastEventsBlock.transfers.forEach((t) => this.undoTransfer(t));
    }

    return { hash: null, number: null };
  }

  async processNewBlocks() {
    const currentBlockNumber = await this.web3.eth.getBlockNumber() - this.confirmations;
    const currentBlockHash = await this.getBlockHash(currentBlockNumber);

    // Check for possible reorgs
    if (this.lastBlockNumber && this.lastBlockHash) {
      const lastBlockHash = await this.getBlockHash(this.lastBlockNumber);
      if (this.lastBlockHash !== lastBlockHash) {
        const lastBlock = await this.undoBlocks();
        this.lastBlockHash = lastBlock.hash;
        this.lastBlockNumber = lastBlock.number;
      }
    }
    
    // Process new blocks
    if (!this.lastBlockNumber || currentBlockNumber > this.lastBlockNumber) {
      await this.processBlocks(this.lastBlockNumber + 1, currentBlockNumber);
      this.lastBlockNumber = currentBlockNumber;
      this.lastBlockHash = currentBlockHash;
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