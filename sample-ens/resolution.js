const Web3 = require('web3');
const ENS = require('ethereum-ens');

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');
  if ((await web3.eth.net.getId()) != 1) throw new Error("This script requires to be connected to mainnet");
  const ens = new ENS(web3.eth.currentProvider);

  // Run name resolution
  const domain = "ethereumfoundation.eth";
  const address = await ens.resolver(domain).addr();
  console.log(`Domain ${domain} resolved to ${address}`);

  // Run reverse resolution
  const reversed = await ens.reverse(address).name();
  console.log(`Address ${address} resolved to ${reversed}`);
}

main();