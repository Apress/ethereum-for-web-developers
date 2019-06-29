const Web3 = require('web3');
const Artifact = require('../artifacts/Bridge.json');

const FROM = process.env.FROM;
const PK = process.env.PK;
const BRIDGE = process.env.BRIDGE;
const AMOUNT = process.env.AMOUNT;
const RECIPIENT = process.env.RECIPIENT;
const PROVIDER_URL = process.env.PROVIDER_URL;
const GAS_PRICE = process.env.GAS_PRICE || 20e6;

async function main() {
  const web3 = new Web3(PROVIDER_URL);
  if (PK) web3.eth.accounts.wallet.add(PK);
  const abi = Artifact.compilerOutput.abi;
  const bridge = new web3.eth.Contract(abi, BRIDGE);
  const value = (AMOUNT * 1e18).toString();
  await bridge.methods.lock(RECIPIENT).send({ value, from: FROM, gas: 1e6, gasPrice: GAS_PRICE });
  
  console.log(`Locked ${AMOUNT} at bridge to be sent to ${RECIPIENT}`);
}

main().catch(err => console.error(err));
