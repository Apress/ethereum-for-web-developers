const Web3 = require('web3');
const BN = require('bignumber.js');
const Contract = require('../99-shared/contract');

function GreeterContract(web3) {
  return Contract(web3, 'Greeter');
}

function IdentityContract(web3) {
  return Contract(web3, 'IdentityWithRewards');
}

async function setup(web3, signer, relayer) {
  // Initialize new identity contract
  const identity = await IdentityContract(web3)
    .deploy({ arguments: [signer] })
    .send({ from: relayer, gasPrice: 1e9, value: 10e18, gas: 4e6 });
  console.log(`Created identity contract at ${identity.options.address} owned by ${signer}`);
  
  // Deploy a third party contract
  const greeter = await GreeterContract(web3)
    .deploy({ arguments: ["Hello"] })
    .send({ from: relayer });
  console.log(`Deployed greeter contract at ${greeter.options.address}`);

  return { identity, greeter };
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');

  // Address and pk of signer
  const signer = '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e';
  const pk = '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4';

  // Address with funds to be used for deployments
  const [relayer] = await web3.eth.getAccounts();

  // Deploy identity and greeter contracts
  const { identity, greeter } = await setup(web3, signer, relayer);

  // Build and sign transaction
  const recipient = greeter.options.address;
  const value = 5000;
  const data = greeter.methods.setGreeting("Hey").encodeABI();
  const gasLimit = 200000 //await greeter.methods.setGreeting("Hey").estimateGas({ value });
  const gasPrice = 1e9;
  const reward = 1e14.toString();
  const hash = await identity.methods.getHash(reward, gasPrice, gasLimit, recipient, value, data).call();
  const signature = web3.eth.accounts.sign(hash, pk).signature;
  console.log(`Signature for request is ${signature}`);

  // Relayer estimates whether they can turn a profit from the execution
  const gasMeta = 60000;
  const requiredGas = gasLimit + gasMeta;
  const forwardingCall = identity.methods
    .forward(reward, gasPrice, gasLimit, recipient, value, data, signature);
  const estimatedGas = await forwardingCall
    .estimateGas({ from: relayer, gasPrice });
  const estimatedProfit = BN(reward).minus(BN(estimatedGas).times(gasPrice));
  const worstCase = BN(reward).minus(BN(requiredGas).times(gasPrice));
  if (estimatedProfit.isNegative()) throw("Refusing to execute transaction without a profit");
  console.log(`Relayer estimates a profit of ${estimatedProfit.shiftedBy(-18).toPrecision(5)} ETH from the execution (worst case ${worstCase.shiftedBy(-18).toPrecision(5)})`);
  const relayerBalance = await web3.eth.getBalance(relayer);  

  // The relayer picks up the transaction and sends it to the contract
  await forwardingCall.send({ from: relayer, gasPrice, gas: gasLimit + gasMeta });
  const newBalance = await web3.eth.getBalance(relayer);
  console.log(`Actual profit was ${BN(newBalance).minus(BN(relayerBalance)).shiftedBy(-18).toPrecision(5)}`);

  // Check execution of the transaction
  const newGreeting = await greeter.methods.greet().call();
  console.log(`Changed greeting to ${newGreeting}`);  
}

main();

