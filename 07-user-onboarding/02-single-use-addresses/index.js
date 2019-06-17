const PROVIDER_URL = process.env.PROVIDER_URL || 'http://localhost:8545';
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const BN = require('bignumber.js');
const Contract = require('../99-shared/contract');

async function main() {
  const web3 = new Web3(PROVIDER_URL);
  const [deployer] = await web3.eth.getAccounts();
  const donations = await Contract(web3, 'Donations').deploy({ arguments: [deployer] }).send({ from: deployer });
  console.log('Deployed donations sample contract at', donations.options.address);

  // Define arguments for the transaction object
  const call = donations.methods.donate("Hello world");
  const data = call.encodeABI();
  const gas = await call.estimateGas({ value: 1e18 })
  const gasPrice = 1e9;
  const value = 1e18;
  const to = donations.options.address;
  const networkId = await web3.eth.net.getId();

  // Create transaction object with an arbitrary signature
  const tx = new Tx({ 
    to, 
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

  console.log('Created single use address', sender, 'to send transaction to donations contract for calling donate("Hello world")');

  // Fund the single-use address
  const required = (new BN(gas)).times(gasPrice).plus(value);
  const [funder] = await web3.eth.getAccounts();
  await web3.eth.sendTransaction({ from: funder, value: required, to: sender });

  // Broadcast the transaction
  const rawTx = '0x' + tx.serialize().toString('hex');
  const receipt = await web3.eth.sendSignedTransaction(rawTx);
  console.log('Sent transaction', receipt.transactionHash ,'from single-use address')
  
  // Check that the event was emitted
  const events = await donations.getPastEvents('Donation');
  console.log('Got event from donation contract with text:', events[0].returnValues.text);
};

main();