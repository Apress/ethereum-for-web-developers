const chai = require('chai');
chai.use(require('chai-bignumber')());
const expect = chai.expect;

const Web3 = require('web3');
const ERC20Artifact = require('./MockERC20.json');
const indexer = require('../indexer');

const PROVIDER_URL = 'http://localhost:9545';

const web3 = new Web3(PROVIDER_URL);
const ERC20 = new web3.eth.Contract(ERC20Artifact.abi, null, { data: ERC20Artifact.bytecode });

function rpcSend(method, ... params) {
  return web3.currentProvider.send({
    jsonrpc: "2.0", method, params
  });
}

function takeSnapshot() {
  return rpcSend("evm_snapshot");
}

function revertToSnapshot(id) {
  return rpcSend("evm_revert", id);
}

function mineBlock() {
  return rpcSend("evm_mine");
}

describe('indexer', function () {
  
  before('setup', async function () {
    this.accounts = await web3.eth.getAccounts();
    this.erc20 = await ERC20.deploy().send({ from: this.accounts[0] });
  });

  beforeEach('create indexer', function () {
    this.indexer = new indexer({ 
      provider: PROVIDER_URL, 
      address: this.erc20.address, 
      startBlock: 0
    });
  });

  afterEach('stop indexer', function () {
    this.indexer.stop();
  });

  beforeEach('take snapshot', async function () {
    this.snapshotId = await takeSnapshot();
  });

  afterEach('revert to snapshot', async function () {
    await revertToSnapshot(this.snapshotId);
  });

  it('records balances from minting events', async function () {
    const [from, holder] = this.accounts.slice(0, 2);
    await this.erc20.mint(holder, 1000).send({ from });
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[holder]).to.be.bignumber.eq("1000");
  });

  it('records balances from transfers', async function () {
    const [from, sender, receiver] = this.accounts.slice(0, 2);
    await this.erc20.mint(sender, 1000).send({ from });
    await this.erc20.send(receiver, 200).send({ from: sender });
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("800");
    expect(this.indexer.getBalances()[receiver]).to.be.bignumber.eq("200");
  });

  it('updates previous balances', async function () {
    const [from, sender, receiver] = this.accounts.slice(0, 2);
    await this.erc20.mint(sender, 1000).send({ from });
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[holder]).to.be.bignumber.eq("1000");

    await this.erc20.send(receiver, 200).send({ from: sender });
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("800");
    expect(this.indexer.getBalances()[receiver]).to.be.bignumber.eq("200");
  });

  it('handles a chain reorganization', async function () {
    
  });

});