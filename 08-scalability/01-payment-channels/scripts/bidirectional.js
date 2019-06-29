const Contract = require('./contract');
const Web3 = require('web3');
const BN = require('bignumber.js');

function sign(aliceBalance, bobBalance, nonce, channel, pk) {
  const web3 = new Web3();
  const hash = web3.utils.soliditySha3(
    { type: 'uint256', value: aliceBalance.toString() },
    { type: 'uint256', value: bobBalance.toString() },
    { type: 'uint256', value: nonce.toString() },
    { type: 'address', value: channel.options.address }
  );
  return web3.eth.accounts.sign(hash, pk).signature;
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');

  // Run in ganache with --deterministic flag to get these accounts
  const alice = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0';
  const alicePk = '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1';
  const bob = '0x22d491bde2303f2f43325b2108d26f1eaba1e32b';
  const bobPk = '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c';
  
  // Log starting funds
  const aliceStartingBalance = await web3.eth.getBalance(alice);
  const bobStartingBalance = await web3.eth.getBalance(bob);
  // console.log("Alice balance", toEth(aliceStartingBalance));
  // console.log("Bob balance  ", toEth(bobStartingBalance));

  // Alice opens the channel
  const channel = await Contract(web3, 'BidirectionalPaymentChannel')
    .deploy({ arguments: [bob] })
    .send({ from: alice, value: 1e18, gas: 3e6 });

  // Bob joins
  await channel.methods.join().send({ from: bob, value: 1e18 });

  // Alice and bob interchange messages
  // • Alice pays 0.4 ETH, signs balances (0.6, 1.4) with nonce 1
  // • Bob   pays 0.3 ETH, signs balances (0.9, 1.1) with nonce 2
  // • Alice pays 0.1 ETH, signs balances (0.8, 1.2) with nonce 3
  // • Alice pays 0.1 ETH, signs balances (0.7, 1.3) with nonce 4
  const msg1 = sign(0.6e18, 1.4e18, 1, channel, alicePk);
  const msg2 = sign(0.9e18, 1.1e18, 2, channel, bobPk);
  const msg3 = sign(0.8e18, 1.2e18, 3, channel, alicePk);
  const msg4 = sign(0.7e18, 1.3e18, 4, channel, alicePk);

  // Alice attempts to submit an older state
  await channel.methods.closeWithState((0.9e18).toString(), (1.1e18).toString(), 2, msg2).send({ from: alice });

  // But Bob overrides with a more recent message
  await channel.methods.closeWithState((0.7e18).toString(), (1.3e18).toString(), 4, msg4).send({ from: bob });

  // Alice eventually yields and confirms the closure
  await channel.methods.confirmClose().send({ from: alice });

  // Log new funds
  const aliceEndingBalance = await web3.eth.getBalance(alice);
  const bobEndingBalance = await web3.eth.getBalance(bob);
  console.log("Alice diff:", toEth(BN(aliceEndingBalance).minus(aliceStartingBalance)));
  console.log("Bob diff:  ", toEth(BN(bobEndingBalance).minus(bobStartingBalance)));
}

function toEth(value) {
  return BN(value).shiftedBy(-18).toString();
}

main();