const Web3 = require('web3');

async function main() {
  const providerUrl = process.env.PROVIDER_URL || 'http://localhost:8545';
  const to = process.argv[2];
  if (!to) {
    console.error("Enter an address to fund");
    return;
  }

  const web3 = new Web3(providerUrl);
  const [from] = await web3.eth.getAccounts();
  const amount = parseInt(process.argv[3]) || 1;
  const value = amount * 1e18;
  const tx = await web3.eth.sendTransaction({ from, to, value });
  console.error(`Funded address ${to} with ${amount} ETH in transaction ${tx.transactionHash}`);
}

main();
