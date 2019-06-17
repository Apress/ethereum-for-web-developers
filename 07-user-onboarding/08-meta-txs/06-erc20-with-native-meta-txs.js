const Web3 = require('web3');
const Contract = require('../99-shared/contract');

function ERC20Contract(web3) {
  return Contract(web3, 'ERC20WithNativeMetaTxs');
}
async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');
  
  // Address and pk of signer
  const signer = '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e';
  const pk = '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4';

  // Address with funds to be used for deployments, relayer, and recipient of the token transfer
  const [deployer, relayer] = await web3.eth.getAccounts();
  const recipient = '0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9';

  // Deploy erc20 contract, and mint a token to signer account
  const erc20 = await ERC20Contract(web3).deploy({ arguments: [signer, 1e6.toString()] }).send({ from: deployer, gas: 3e6 });
  console.log(`Deployed ERC20 contract at ${erc20.options.address}`);
  console.log(`Signer balance is ${await erc20.methods.balanceOf(signer).call()} tokens`);
  
  // Build and sign transaction
  const hash = await erc20.methods.getTransferHash(recipient, 1e5.toString(), 0, 1e4.toString()).call();
  const signature = web3.eth.accounts.sign(hash, pk).signature;

  // The relayer picks up the transaction and sends it to the contract
  await erc20.methods
    .signedTransfer(recipient, 1e5.toString(), 0, 1e4.toString(), signature)
    .send({ from: relayer });
  console.log(`Sent meta transaction to ERC20`);

  // Check new balances
  console.log(`Signer has now ${await erc20.methods.balanceOf(signer).call()} tokens`);
  console.log(`Recipient has ${await erc20.methods.balanceOf(recipient).call()} tokens`);
  console.log(`Relayer has ${await erc20.methods.balanceOf(relayer).call()} tokens`);
}

main();