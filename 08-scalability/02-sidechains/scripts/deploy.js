const Web3 = require('web3');
const Artifact = require('../artifacts/Bridge.json');

const VALIDATORS = process.env.VALIDATORS ? process.env.VALIDATORS.split(',') : ['0x8305ccac527202b400e083e923ea7ae458269a7d', '0x152480153f76c582421cadbfeff1c40386a4760a', '0x4c6f5acdd89adf2fcdf08e7a7e70b7ba07587353'];
const THRESHOLD = process.env.THRESHOLD || Math.ceil(VALIDATORS.length / 2).toString();
const FROM = process.env.FROM;
const PROVIDER_URL = process.env.PROVIDER_URL;
const GAS_PRICE = process.env.GAS_PRICE || 20e6;
const VALUE = process.env.VALUE || 10e18.toString();

async function main() {
  const web3 = new Web3(PROVIDER_URL);
  const abi = Artifact.compilerOutput.abi;
  const data = Artifact.compilerOutput.evm.bytecode.object;
  const Bridge = new web3.eth.Contract(abi, null, { data });
  const bridge = await Bridge.deploy({ arguments: [THRESHOLD, VALIDATORS] }).send({ from: FROM, gas: 1e6, gasPrice: GAS_PRICE, value: VALUE });
  
  console.log("Bridge deployed at", bridge.options.address);
}

main();
