import Web3 from 'web3';
import { expect } from 'chai';
import CounterContract from './Counter';

describe('CounterContract', function() {
  let factory,
      contract;

  beforeAll(async function() {
    const web3 = new Web3('ws://localhost:9545');
    const accounts = await web3.eth.getAccounts();
    const from = accounts[0];
    factory = CounterContract(web3, null, { from });
  });

  beforeEach(async function() {
    contract = await factory.deploy().send({ gas: 1000000 });
  });

  it('increases counter', async function() {
    await contract.methods.increase().send();
    const value = await contract.methods.value().call();
    expect(value.toString()).to.eq('1');
  });

  it('emits event', async function() {
    const receipt = await contract.methods.increase().send();
    expect(receipt.events).to.have.key('Increased');
    const { newValue } = receipt.events.Increased.returnValues;
    expect(newValue.toString()).to.eq('1');
  });
});