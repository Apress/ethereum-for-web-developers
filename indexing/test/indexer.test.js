const chai = require('chai');
chai.use(require('chai-bignumber')());
const expect = chai.expect;

const Web3 = require('web3');
const ERC20Artifact = require('../artifacts/MockERC20.json');
const Indexer = require('../reorgs-indexer');
const { takeSnapshot, revertToSnapshot, mineBlocks } = require('./helpers');

const PROVIDER_URL = 'http://localhost:9545';

const web3 = new Web3(PROVIDER_URL);
const ERC20 = new web3.eth.Contract(ERC20Artifact.compilerOutput.abi, null, { data: ERC20Artifact.compilerOutput.evm.bytecode.object });

describe('indexer', function () {
  
  before('setup', async function () {
    this.accounts = await web3.eth.getAccounts();
    this.erc20 = await ERC20.deploy().send({ from: this.accounts[0], gas: 1e6 });
  });

  beforeEach('create indexer', function () {
    this.indexer = new Indexer({ 
      provider: PROVIDER_URL, 
      address: this.erc20.options.address, 
      startBlock: 0,
      confirmations: 3,
      debug: false
    });
  });

  afterEach('stop indexer', async function () {
    await this.indexer.stop();
  });

  beforeEach('take snapshot', async function () {
    this.snapshotId = await takeSnapshot(web3);
  });

  afterEach('revert to snapshot', async function () {
    await revertToSnapshot(web3, this.snapshotId);
  });

  it('records balances from minting', async function () {
    const [from, holder] = this.accounts;
    await this.erc20.methods.mint(holder, 1000).send({ from });
    await mineBlocks(web3, 3);
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[holder]).to.be.bignumber.eq("1000");
  });

  it('records balances from transfer', async function () {
    const [from, sender, receiver] = this.accounts;
    await this.erc20.methods.mint(sender, 1000).send({ from });
    await this.erc20.methods.transfer(receiver, 200).send({ from: sender });
    await mineBlocks(web3, 3);
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("800");
    expect(this.indexer.getBalances()[receiver]).to.be.bignumber.eq("200");
  });

  it('updates previous balances', async function () {
    const [from, sender, receiver] = this.accounts;
    await this.erc20.methods.mint(sender, 1000).send({ from });
    await mineBlocks(web3, 3);
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("1000");

    await this.erc20.methods.transfer(receiver, 200).send({ from: sender });
    await mineBlocks(web3, 3);
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("800");
    expect(this.indexer.getBalances()[receiver]).to.be.bignumber.eq("200");
  });

  it('ignores unconfirmed transfers', async function () {
    const [from, sender, receiver] = this.accounts;
    await this.erc20.methods.mint(sender, 1000).send({ from });
    await mineBlocks(web3, 3);
    await this.erc20.methods.transfer(receiver, 200).send({ from: sender });
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("1000");
  });

  it('handles reorganizations', async function () {
    const [from, sender, r1, r2] = this.accounts;
    await this.erc20.methods.mint(sender, 1000).send({ from });
    const snapshotId = await takeSnapshot(web3);
    
    await this.erc20.methods.transfer(r1, 200).send({ from: sender });
    await this.erc20.methods.transfer(r2, 200).send({ from: sender });
    await mineBlocks(web3, 3);
    
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("600");
    expect(this.indexer.getBalances()[r1]).to.be.bignumber.eq("200");
    expect(this.indexer.getBalances()[r2]).to.be.bignumber.eq("200");

    await revertToSnapshot(web3, snapshotId);
    await this.erc20.methods.transfer(r1, 300).send({ from: sender });
    await mineBlocks(web3, 5);
    
    await this.indexer.processNewBlocks();
    expect(this.indexer.getBalances()[sender]).to.be.bignumber.eq("700");
    expect(this.indexer.getBalances()[r1]).to.be.bignumber.eq("300");
    expect(this.indexer.getBalances()[r2]).to.be.bignumber.eq("0");
  });

});