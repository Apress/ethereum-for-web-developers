const PROVIDER_URL = process.env.PROVIDER_URL || 'http://localhost:8545';
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BN = require('bignumber.js');

async function main() {
  const web3 = new Web3(PROVIDER_URL);
  const networkId = await web3.eth.net.getId();
  const address = require('./artifacts/Deploys.json')[networkId];
  const abi = require('./artifacts/Donations.json').compilerOutput.abi;
  const donations = new web3.eth.Contract(abi, address);

  // Define arguments for the transaction object
  const call = donations.methods.donate("Hello world");
  const data = call.encodeABI();
  const gas = await call.estimateGas({ value: 1e18 })
  const gasPrice = 1e9;
  const value = 1e18;

  // Create transaction object with an arbitrary signature
  const tx = new Tx({ 
    to: address, 
    value, 
    gas,
    gasPrice, 
    nonce: "0x0", 
    data, 
    v: networkId * 2 + 35,
    s: '0x' + '2'.repeat(61),
    r: '0x' + '3'.repeat(61)
  });

  // Iterate signature values until a valid one is found
  let sender = null;
  while (!sender) {
    try {
      sender = '0x' + tx.getSenderAddress().toString('hex');
    } catch(ex) {
      const r = new BN('0x' + tx.r.toString('hex'));
      tx.r = '0x' + r.plus(1).toString(16);
    }
  }

  // Fund the single-use address
  const required = (new BN(gas)).times(gasPrice).plus(value);
  const funder = (await web3.eth.getAccounts())[0];
  await web3.eth.sendTransaction({ from: funder, value: required, to: sender });

  // Broadcast the transaction
  const rawTx = '0x' + tx.serialize().toString('hex');
  await web3.eth.sendSignedTransaction(rawTx);
  
  // Check that the event was emitted
  const events = await donations.getPastEvents('Donation');
  console.log(events[0].returnValues.text);
};

main();