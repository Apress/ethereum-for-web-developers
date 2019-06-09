import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-6, 24], DECIMAL_PLACES: 4 })

export function formatValue(value, decimals) {
  const bn = new BigNumber(value);
  return bn.shiftedBy(-decimals).toString(10);
}