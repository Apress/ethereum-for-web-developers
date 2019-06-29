const Web3 = require('web3');
const Artifact = require('../artifacts/Bridge.json');

const VALIDATOR = process.env.VALIDATOR;
const REMOTE_BRIDGE = process.env.REMOTE_BRIDGE;
const LOCAL_BRIDGE = process.env.LOCAL_BRIDGE;
const REMOTE_PROVIDER_URL = process.env.REMOTE_PROVIDER_URL;
const LOCAL_PROVIDER_URL = process.env.LOCAL_PROVIDER_URL;
const GAS_PRICE = process.env.GAS_PRICE || 20e6;

async function validateCode(web3, address) {
  const code = await web3.eth.getCode(address);
  if (!code || code.length <= 2) {
    throw new Error(`No code found at ${address}`);
  }
}

function watch(lockingEnd, unlockingEnd) {
  lockingEnd.events.Locked().on('data', function({ returnValues: data }) {
    console.log(`Unlocking ${data.amount} for ${data.recipient} (id ${data.id})`)
    unlockingEnd.methods
      .unlock(data.id, data.amount, data.recipient)
      .send({ from: VALIDATOR, gas: 1e6, gasPrice: GAS_PRICE })
      .then(tx => console.log(`Unlocked ${data.id} in ${tx.transactionHash}`))
      .catch(err => console.error(`Error unlocking ${data.id}: ${err.message}`));
  });
}

async function main() {
  const remoteWeb3 = new Web3(REMOTE_PROVIDER_URL);
  const localWeb3 = new Web3(LOCAL_PROVIDER_URL);
  await validateCode(remoteWeb3, REMOTE_BRIDGE);
  await validateCode(localWeb3, LOCAL_BRIDGE);

  const abi = Artifact.compilerOutput.abi;
  const remoteBridge = new remoteWeb3.eth.Contract(abi, REMOTE_BRIDGE);
  const localBridge = new localWeb3.eth.Contract(abi, LOCAL_BRIDGE);

  watch(remoteBridge, localBridge);
  watch(localBridge, remoteBridge);
}

main()
.then(() => {
  console.log("Watching...");
  process.stdin.resume();
}).catch(err => console.error(err));
