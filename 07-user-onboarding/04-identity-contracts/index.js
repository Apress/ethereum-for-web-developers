const Web3 = require('web3');
const Contract = require('../99-shared/contract');

function GreeterContract(web3) {
  return Contract(web3, 'Greeter');
}

function IdentityContract(web3) {
  return Contract(web3, 'Identity');
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');
  const [mainDevice, anotherDevice, thirdParty] = await web3.eth.getAccounts();

  // Initialize new identity contract
  const identity = await IdentityContract(web3)
    .deploy({ arguments: [mainDevice] })
    .send({ from: mainDevice, gasPrice: 1e9, value: 10e18 });
  console.log(`Created identity contract at ${identity.options.address} owned by ${mainDevice}`);

  // Add anotherDevice as a user account
  await identity.methods.addAccount(anotherDevice)
    .send({ from: mainDevice });
    console.log(`Account ${anotherDevice} added to the identity\n`);

  // Send funds to a third party from the secondary device
  await identity.methods.forward(thirdParty, 1e18.toString(), [])
    .send({ from: anotherDevice });
  console.log(`Sent 1 ETH to ${thirdParty}`);
  const identityFunds = await web3.eth.getBalance(identity.options.address);
  const thirdPartyFunds = await web3.eth.getBalance(thirdParty);
  console.log(`Identity funds are now ${identityFunds} and third party are ${thirdPartyFunds}\n`);

  // Deploy a third party contract
  const greeter = await GreeterContract(web3)
    .deploy({ arguments: ["Hello"] })
    .send({ from: thirdParty });
  console.log(`Deployed greeter contract at ${greeter.options.address}`);

  // Send transaction to greeter changing greeting from identity
  const data = greeter.methods.setGreeting("Hey").encodeABI();
  await identity.methods.forward(greeter.options.address, "5000", data)
    .send({ from: anotherDevice });  
  const newGreeting = await greeter.methods.greet().call();
  console.log(`Changed greeting to ${newGreeting}`);
}

main();