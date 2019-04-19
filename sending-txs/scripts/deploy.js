const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

async function deploy(artifact, arguments, opts) {
  const providerUrl = process.env.PROVIDER_URL || 'http://localhost:8545';
  const web3 = new Web3(providerUrl);
  const from = (await web3.eth.getAccounts())[0];
  const data = artifact.compilerOutput.evm.bytecode.object;
  const abi = artifact.compilerOutput.abi;
  const Contract = new web3.eth.Contract(abi, null, { data });
  const gasPrice = 1e9;
  const instance = await Contract.deploy({ arguments }).send({ from, gasPrice, ...opts });
  const address = instance.options.address;
  const network = await web3.eth.net.getId();
  save(network, address);
  console.log(address);
}

function save(network, address) {
  const file = path.join(__dirname, '..', 'artifacts', 'Deploys.json');
  const deployments = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  deployments[network] = address;
  fs.writeFileSync(file, JSON.stringify(deployments, null, 2));
}

function main() {
  const artifact = require('../artifacts/ERC721PayPerMint.json');
  return deploy(artifact, [], { gas: 5e6, gasPrice: 1e9 });
}

main();
