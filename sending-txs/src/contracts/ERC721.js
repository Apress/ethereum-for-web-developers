import Artifact from '../artifacts/ERC721PayPerMint.json';
import Deploys from '../artifacts/Deploys.json';
import { getWeb3, getAccount, getNetwork } from '../eth/network.js';

export default function ERC721(web3, address = null, options = {}) {
  const abi = Artifact.compilerOutput.abi;
  return new web3.eth.Contract(abi, address, { ...options });
}

export async function getDeployed() {
  const web3 = getWeb3();
  const from = await getAccount();
  const network = await getNetwork();
  const address = process.env.REACT_APP_CONTRACT_ADDRESS || Deploys[network];
  if (!address) throw new Error(`Could not find address for contract in network ${network}`);
  return ERC721(web3, address, { from });
}