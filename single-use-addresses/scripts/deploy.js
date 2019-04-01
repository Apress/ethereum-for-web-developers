const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Deploys any artifact from the default account
async function deploy(artifact, arguments, opts) {
  const web3 = getWeb3();
  const from = (await web3.eth.getAccounts())[0];
  const data = artifact.compilerOutput.evm.bytecode.object;
  const abi = artifact.compilerOutput.abi;
  const Contract = new web3.eth.Contract(abi, null, { data });
  const gasPrice = 1e9;
  const instance = await Contract.deploy({ arguments })
                         .send({ from, gasPrice, ...opts });
  const address = instance.options.address;
  const network = await web3.eth.net.getId();
  save(network, address);
  console.log(address);
}

// Saves deployment address to a Deploys.json file
function save(network, address) {
  const file = path.join(
    __dirname, '..', 'artifacts', 'Deploys.json'
  );
  const deployments = fs.existsSync(file) 
    ? JSON.parse(fs.readFileSync(file)) : {};
  deployments[network] = address;
  const content = JSON.stringify(deployments, null, 2);
  fs.writeFileSync(file, content);
}

function getWeb3() {
  const providerUrl = process.env.PROVIDER_URL || 'http://localhost:8545';
  return new Web3(providerUrl);
}

// Deploys our contract
async function main() {
  const artifactPath = '../artifacts/Donations.json';
  const artifact = require(artifactPath);
  const wallet = (await getWeb3().eth.getAccounts())[0];
  return deploy(artifact, [wallet], { gas: 5e6, gasPrice: 1e9 });
}

main();