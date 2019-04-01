const Web3 = require('web3');

function Contract(web3, artifactName) {
  const artifactPath = `./artifacts/${artifactName}.json`;
  const artifact = require(artifactPath);
  const data = artifact.compilerOutput.evm.bytecode.object;
  const abi = artifact.compilerOutput.abi;
  return new web3.eth.Contract(abi, null, { data, gas: 1e6 });
}

function SignaturesContract(web3) {
  return Contract(web3, 'Signatures');
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');

  // Address and pk of signer, and message to sign
  let address = '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e';
  let pk = '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4';
  let message = 'Hello world';

  // Sign message hash
  let hash = web3.utils.keccak256(message);
  let signed = web3.eth.accounts.sign(hash, pk)
  console.log(`Signed message '${message}' with account ${address}`);

  // Recover address
  const signer = web3.eth.accounts.recover(hash, signed.signature);
  console.log(`Recovered address ${signer} as signer`);

  // Deploy Signatures contract
  const accounts = await web3.eth.getAccounts();
  const signatures = await SignaturesContract(web3).deploy().send({ from: accounts[0], gasPrice: 1e9 });

  // Recover address from signatures contract
  const recovered = await signatures.methods.recover(message, signed.signature).call();
  console.log(`Recovered address ${recovered} via smart contract`);
}

main();