import { get } from 'axios';
import BigNumber from 'bignumber.js';

const URL = 'https://www.etherchain.org/api/gasPriceOracle';

export async function getGasPrice() {
  const { data: gasData } = await get(URL);
  const bn = new BigNumber(gasData.fast); 
  return bn.shiftedBy(9).toString(10);
}