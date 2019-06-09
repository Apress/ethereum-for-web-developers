import Web3 from 'web3';

let web3;

export function getWeb3() {
  if (!web3) {
    web3 = new Web3(window.ethereum || (window.web3 && window.web3.currentProvider) || process.env.REACT_APP_PROVIDER_URL);
  } return web3;
}