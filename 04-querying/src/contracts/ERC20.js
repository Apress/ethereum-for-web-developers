import ERC20Artifact from 'openzeppelin-solidity/build/contracts/ERC20Detailed.json';

export default function ERC20(web3, address = null, options = {}) {
  const { abi } = ERC20Artifact;
  return new web3.eth.Contract(abi, address, options);
}
