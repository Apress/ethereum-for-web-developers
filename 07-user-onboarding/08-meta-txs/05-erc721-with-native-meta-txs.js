const Web3 = require('web3');
const Contract = require('../99-shared/contract');

function ERC721Contract(web3) {
  return Contract(web3, 'ERC721WithNativeMetaTxs');
}
async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545');
  
  // Address and pk of signer
  const signer = '0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e';
  const pk = '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4';

  // Address with funds to be used for deployments, and recipient of the token transfer
  const [relayer] = await web3.eth.getAccounts();
  const recipient = '0x3e5e9111ae8eb78fe1cc3bb8915d5d461f3ef9a9';

  // Deploy erc721 contract, and mint a token to signer account
  const erc721 = await ERC721Contract(web3).deploy().send({ from: relayer, gas: 3e6 });
  console.log(`Deployed ERC721 contract at ${erc721.options.address}`);
  const tokenId = 42;
  await erc721.methods.mint(signer, tokenId).send({ from: relayer });
  console.log(`Minted token ${tokenId} to ${signer}`);
  
  // Build and sign transaction
  const hash = await erc721.methods.getTransferHash(signer, recipient, tokenId, 0).call();
  const signature = web3.eth.accounts.sign(hash, pk).signature;

  // The relayer picks up the transaction and sends it to the contract
  await erc721.methods
    .signedTransferFrom(signer, recipient, tokenId, 0, signature)
    .send({ from: relayer });
  console.log(`Sent meta transaction to ERC721 with transfer`);

  // Check new ownership of the token
  const newOwner = await erc721.methods.ownerOf(tokenId).call();
  console.log(`Changed ownership of ${tokenId} to ${newOwner}`);  
}

main();