import Web3 from 'web3';

let web3;

export function getWeb3() {
  if (!web3) {
    web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER || 'http://localhost:8545');
  }
  return web3;
}

export async function getNetwork() {
  return web3.eth.net.getId();
}

export async function getBlockNumber() {
  return web3.eth.getBlockNumber();
}