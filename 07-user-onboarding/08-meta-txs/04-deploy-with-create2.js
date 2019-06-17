const Web3 = require('web3');
const BN = require('bignumber.js');
const Contract = require('../99-shared/contract');

function IdentityFactoryContract(web3) {
  return Contract(web3, 'IdentityFactoryWithRewards');
}

function IdentityContract(web3, address) {
  return Contract(web3, 'Identity', address);
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');

  // Address of identity owner
  const owner = '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e';

  // Address with funds to be used for deployments or funding
  const [deployer, relayer, exchange] = await web3.eth.getAccounts();

  // Deploy identity factory
  const factory = await IdentityFactoryContract(web3)
    .deploy().send({ from: deployer, gasPrice: 1e9, gas: 4e6 });
  console.log(`Created identity factory contract at ${factory.options.address}`);

  // Generate random salt (see https://dilbert.com/strip/2001-10-25)
  const salt = 9;

  // Get deployment address
  const reward = 1e17.toString();
  const deploymentAddress = await factory.methods.getDeploymentAddress(owner, reward, salt).call();
  console.log(`Predicted deployment address is`, deploymentAddress);

  // Fund the target address
  await web3.eth.sendTransaction({ from: exchange, value: 1e18, to: deploymentAddress });
  
  // Relayer executes the deployment
  const relayerFunds = await web3.eth.getBalance(relayer);
  const deployment = factory.methods.deploy(owner, reward, salt);
  const gas = await deployment.estimateGas({ from: relayer });
  const tx = await deployment.send({ gasPrice: 1e9, gas: 4e6, from: relayer });
  console.log(`Deployment succeeded at`, tx.events.IdentityCreated.returnValues.identity);

  // Verify deployment and reward payment
  const newRelayerFunds = await web3.eth.getBalance(relayer);
  console.log(`Relayer profit was ${BN(newRelayerFunds).minus(relayerFunds).shiftedBy(-18)} ETH`);
  const identity = IdentityContract(web3, deploymentAddress);
  const isRegistered = await identity.methods.accounts(owner).call();
  console.log("Checking if owner is registered in identity:", isRegistered);
  
}

main();

