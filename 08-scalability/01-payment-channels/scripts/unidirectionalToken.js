const Contract = require('./contract');
const Web3 = require('web3');
const BN = require('bignumber.js');

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');

  // Run in ganache with --deterministic flag to get these accounts
  const recipient = '0x22d491bde2303f2f43325b2108d26f1eaba1e32b';
  const sender = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0';
  const senderpk = '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1';
  
  // Create initial token, with 10e18 balance for the sender
  const token = await Contract(web3, 'SampleToken')
    .deploy({ arguments: [sender, 10e18.toString()] })
    .send({ from: sender });

  // Sender opens channel and seeds it with tokens
  const endTime = +(new Date()) +(300 * 1000);
  const channel = await Contract(web3, 'TokenPaymentChannel')
    .deploy({ arguments: [recipient, endTime, token.options.address] })
    .send({ from: sender });
  await token.methods.transfer(channel.options.address, 1e18.toString()).send({ from: sender });
  console.log("Created channel with 1 token");

  // Sends signed message to recipient
  const hash = web3.utils.soliditySha3(
    { type: 'uint256', value: 3e17.toString() },
    { type: 'address', value: channel.options.address }
  );
  const { signature } = web3.eth.accounts.sign(hash, senderpk);
  console.log("Sender sends signed value of 0.3 tokens to recipient", signature);

  // Recipient uses signature to close channel
  await channel.methods.close(3e17.toString(), signature).send({ from: recipient });
  console.log("Recipient closed the channel")

  // Log new funds
  const recipientEndingBalance = await token.methods.balanceOf(recipient).call();
  const senderEndingBalance = await token.methods.balanceOf(sender).call();
  console.log("Recipient balance", toEth(recipientEndingBalance));
  console.log("Sender balance   ", toEth(senderEndingBalance));
}

function toEth(value) {
  return BN(value).shiftedBy(-18).toString();
}

main();