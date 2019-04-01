const Web3 = require('web3');
const GreeterArtifact = require('../build/contracts/Greeter.json');

async function main() {
  const providerUrl = process.env.PROVIDER_URL || 'http://localhost:8545';
  const web3 = new Web3(providerUrl);
  const from = (await web3.eth.getAccounts())[0];
  const gas = 1e6;
  const data = GreeterArtifact.compilerOutput.evm.bytecode.object;
  const abi = GreeterArtifact.compilerOutput.abi;
  const Greeter = new web3.eth.Contract(abi, null, { data });
  const arguments = ["Hello world!"];
  const greeter = await Greeter.deploy({ arguments }).send({ from, gas });
  const address = greeter.options.address;
  console.log(address);
}

main();