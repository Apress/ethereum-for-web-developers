const Contract = require('./contract');
const Web3 = require('web3');
const BN = require('bignumber.js');

function sign(balance, nonce, channel, pk) {
  const web3 = new Web3();
  const hash = web3.utils.soliditySha3(
    { type: 'int256', value: balance.toString() },
    { type: 'uint256', value: nonce.toString() },
    { type: 'address', value: channel.options.address }
  );
  return web3.eth.accounts.sign(hash, pk).signature;
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');

  // Run in ganache with --deterministic flag to get these accounts
  const deployer = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1';
  const alice = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0';
  const alicePk = '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1';
  const bob = '0x22d491bde2303f2f43325b2108d26f1eaba1e32b';
  const bobPk = '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c';
  
  // Log starting funds
  const aliceStartingBalance = await web3.eth.getBalance(alice);
  const bobStartingBalance = await web3.eth.getBalance(bob);
  console.log("Alice balance", toEth(aliceStartingBalance));
  console.log("Bob balance  ", toEth(bobStartingBalance));

  // Someone opens the channel
  const channel = await Contract(web3, 'BidirectionalPaymentChannel')
    .deploy({ arguments: [alice, bob] })
    .send({ from: deployer });
  const channelAddress = channel.options.address;

  // Both make initial deposits
  await web3.eth.sendTransaction({ to: channelAddress, from: alice, value: 1e18 });
  await web3.eth.sendTransaction({ to: channelAddress, from: bob, value: 1e18 });

  // Alice and bob interchange messages
  // Positive balances mean alice takes the payment, negative for bob
  const msg1 = sign(-1e17, 1, channel, alicePk);
  const msg2 = sign(2e17, 2, channel, bobPk);
  const msg3 = sign(-2e17, 3, channel, alicePk);
  const msg4 = sign(1e17, 4, channel, bobPk);

  // Bob attempts to submit an older state
  await channel.methods.startClose((-2e17).toString(), 3, msg3).send({ from: bob });

  // But Alice overrides with a more recent message
  await channel.methods.startClose((1e17).toString(), 4, msg4).send({ from: alice });

  // Bob eventually yields and confirms the closure
  await channel.methods.confirmClose(4).send({ from: bob });

  // Log new funds
  const aliceEndingBalance = await web3.eth.getBalance(alice);
  const bobEndingBalance = await web3.eth.getBalance(bob);
  console.log("Alice gained", toEth(BN(aliceEndingBalance).minus(aliceStartingBalance)));
  console.log("Bob lost    ", toEth(BN(bobStartingBalance).minus(bobEndingBalance)));
}

function toEth(value) {
  return BN(value).shiftedBy(-18).toString();
}

main();