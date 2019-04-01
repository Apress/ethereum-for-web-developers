const Web3 = require('web3');

function Contract(web3, artifactName) {
  const artifactPath = `./artifacts/${artifactName}.json`;
  const artifact = require(artifactPath);
  const data = artifact.compilerOutput.evm.bytecode.object;
  const abi = artifact.compilerOutput.abi;
  return new web3.eth.Contract(abi, null, { data, gas: 1e6 });
}

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
    .send({ from: relayer, gasPrice: 1e9, value: 10e18 });
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
  const gasLimit = await greeter.methods.setGreeting("Hey").estimateGas({ value });
  const gasPrice = 1e9;
  const reward = 1e15.toString();
  const hash = await identity.methods.getHash(reward, gasPrice, gasLimit, recipient, value, data).call();
  const signature = web3.eth.accounts.sign(hash, pk).signature;
  console.log(`Signature for request is ${signature}`);

  // Relayer estimates whether they can turn a profit from the execution
  const totalGas = gasLimit + 60000;
  const profit = parseInt(reward) - totalGas * gasPrice;
  if (profit <= 0) throw("Refusing to execute transaction without a profit");
  console.log(`Relayer estimates a profit of ${profit / 1e18} ETH from the execution`);
  const relayerBalance = await web3.eth.getBalance(relayer);

  // The relayer picks up the transaction and sends it to the contract
  await identity.methods
    .forward(reward, gasPrice, gasLimit, recipient, value, data, signature)
    .send({ from: relayer, gasPrice, gas: totalGas });
  const newBalance = await web3.eth.getBalance(relayer);
  console.log(`Actual profit was ${(newBalance - relayerBalance) / 1e18}`);

  // Check execution of the transaction
  const newGreeting = await greeter.methods.greet().call();
  console.log(`Changed greeting to ${newGreeting}`);  
}

main();