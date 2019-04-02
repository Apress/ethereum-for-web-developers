const PROVIDER_URL = process.env.PROVIDER_URL || 'http://localhost:8545';
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const Util = require('ethereumjs-util');
const BN = require('bignumber.js');

async function main() {
  const web3 = new Web3(PROVIDER_URL);
  const networkId = await web3.eth.net.getId();
  const artifact = require('./artifacts/Identity.json');
  const abi = artifact.compilerOutput.abi;
  const bytecode = artifact.compilerOutput.evm.bytecode.object;
  const contract = new web3.eth.Contract(abi, null, { data: bytecode });

  // Define arguments for the transaction object
  const owner = '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e';
  const call = contract.deploy({ arguments: [owner] });
  const data = call.encodeABI();
  const gas = await call.estimateGas();
  const gasPrice = 1e9;
  const value = 1e18;
  const nonce = "0x00";
  const to = null;

  // Create transaction object with an arbitrary signature
  const tx = new Tx({ 
    to, 
    value, 
    gas,
    gasPrice, 
    nonce, 
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
  console.log("Single-use address is", sender);

  // Find target address
  const deploymentAddress = '0x' + Util.generateAddress(
    Buffer.from(sender.substring(2), 'hex'), 
    Buffer.from(nonce, 'hex')
  ).toString('hex')
  console.log("Identity contract will be deployed at", deploymentAddress);

  // Fund the single-use address
  const required = (new BN(gas)).times(gasPrice).plus(value);
  const funder = (await web3.eth.getAccounts())[0];  
  await web3.eth.sendTransaction({ from: funder, value: required, to: sender });
  console.log(`Funded single-use address with ${required.shiftedBy(-18)} ETH`);

  // Broadcast the transaction
  const rawTx = '0x' + tx.serialize().toString('hex');
  await web3.eth.sendSignedTransaction(rawTx);

  // Verify deployment
  const identity = new web3.eth.Contract(abi, deploymentAddress, { data: bytecode });
  const isRegistered = await identity.methods.accounts(owner).call();
  console.log("Checking if owner is registered in identity:", isRegistered);
};

main();