import Artifact from '../artifacts/PaymentChannel.json';

export default function PaymentChannel(web3, address, options) {
  const abi = Artifact.compilerOutput.abi;
  const data = Artifact.compilerOutput.evm.bytecode.object;
  return new web3.eth.Contract(abi, address, { data, ...options });
}

export async function signPayment(web3, value, address, sender) {
  const hash = web3.utils.soliditySha3(
    { type: 'uint256', value: value.toString() },
    { type: 'address', value: address }
  );
  const signature = await web3.eth.sign(hash, sender);
  
  // FIX: eth.sign is returning an invalid recovery value (v from r,s,v)
  // To be compliant with EIP155 we need to add 27 to it
  const v = parseInt(signature.substr(signature.length - 2), 16);
  const fixedV = (v <= 1 ? v + 27 : v).toString(16);
  return signature.slice(0, signature.length - 2) + fixedV;
}

export function recoverPayment(web3, value, address, signature) {  
  const hash = web3.utils.soliditySha3(
    { type: 'uint256', value: value.toString() },
    { type: 'address', value: address }
  );
  const signer = web3.eth.accounts.recover(hash, signature);
  return signer;
}

export async function checkBytecode(web3, address) {
  const actual = await web3.eth.getCode(address);
  const expected = Artifact.compilerOutput.evm.deployedBytecode.object;
  return actual === expected;
}