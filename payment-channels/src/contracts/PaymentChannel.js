import Artifact from '../artifacts/PaymentChannel.json';

export default function PaymentChannel(web3, address, options) {
  const abi = Artifact.compilerOutput.abi;
  const data = Artifact.compilerOutput.evm.bytecode.object;
  return new web3.eth.Contract(abi, address, { data, ...options });
}

export function signPayment(web3, value, address, senderPk) {
  const hash = web3.utils.soliditySha3(
    { type: 'uint256', value: value.toString() },
    { type: 'address', value: address }
  );
  const { signature } = web3.eth.accounts.sign(hash, senderPk);
  return signature;
}

export function recoverPayment(web3, value, address, signature) {  
  const hash = web3.utils.soliditySha3(
    { type: 'uint256', value: value.toString() },
    { type: 'address', value: address }
  );
  const signer = web3.eth.accounts.recover(hash, signature);
  return signer;
}