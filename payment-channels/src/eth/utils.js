import BN from "bignumber.js";

export function toEth(bn) {
  return bn && `${BN(bn).shiftedBy(-18).toString()} ETH`;
}

export function areAddressesEqual(a1, a2) {
  return a1 && a2 && a1.toLowerCase() === a2.toLowerCase();
}