const Web3 = require('web3');

function Contract(web3, artifactName, address) {
  const artifactPath = `./artifacts/${artifactName}.json`;
  const artifact = require(artifactPath);
  const data = artifact.compilerOutput.evm.bytecode.object;
  const abi = artifact.compilerOutput.abi;
  return new web3.eth.Contract(abi, address, { data, gas: 1e6 });
}

function UpgradeableIdentity(web3, address) {
  return Contract(web3, 'UpgradeableIdentity', address);
}

function UpgradeableIdentityV2(web3, address) {
  return Contract(web3, 'UpgradeableIdentityV2', address);
}

function DelegateProxy(web3, address) {
  return Contract(web3, 'DelegateProxy', address);
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');
  const [application, user, anotherDevice] = await web3.eth.getAccounts();

  // Application deploys logic contract
  const logic = await UpgradeableIdentity(web3).deploy()
    .send({ from: application, gasPrice: 1e9 });
  console.log(`Created identity logic contract at ${logic.options.address}`);

  // User deploys proxy to logic contract and send 1ETH
  const initData = logic.methods.initialize(user).encodeABI();
  const proxy = await DelegateProxy(web3)
    .deploy({ arguments: [logic.options.address, initData] })
    .send({ from: application, gasPrice: 1e9, value: 1e18 });
  console.log(`Created proxy to identity at ${proxy.options.address}`);

  // Verify that the initialization was correct and register a new device
  const identity = UpgradeableIdentity(web3, proxy.options.address);
  const isOwner = await identity.methods.accounts(user).call();
  if (!isOwner) throw new Error(`User address ${user} is not an account of the identity`);
  await identity.methods.addAccount(anotherDevice).send({ from: user });
  console.log(`Identity contract is now managed by ${user} and ${anotherDevice}`);

  // Application deploys new version of identity logic contract
  const logicV2 = await UpgradeableIdentityV2(web3).deploy()
    .send({ from: application, gasPrice: 1e9 });
  console.log(`Created identity logic contract V2 at ${logicV2.options.address}`);

  // User upgrades their identity contract to the new version
  await identity.methods.upgradeTo(logicV2.options.address).send({ from: user });

  // Verify that state and balance are preserved during upgrade
  if (!(await identity.methods.accounts(user).call()) ||
      !(await identity.methods.accounts(anotherDevice).call()) ||
       (await web3.eth.getBalance(identity.options.address) !== 1e18.toString())) {
    throw new Error(`Manager accounts or balance not kept during upgrade`);
  }

  // Verify that new contract version is available on the same address
  const identityV2 = UpgradeableIdentityV2(web3, proxy.options.address);
  const echoed = await identityV2.methods.echo('foo').call();
  console.log(`Echoed ${echoed} from new identity contract`);
}

main();