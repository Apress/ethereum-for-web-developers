import React from 'react';
import { formatValue } from '../utils/format';
import Address from './Address';
import './Transfer.css';

export default function Transfer (props) {
  const { decimals, symbol, transfer } = props;
  const { from, to, value } = transfer.returnValues;
  const url = `https://etherscan.io/tx/${transfer.transactionHash}`;
  const roundedValue = formatValue(value, decimals);
  
  return (
    <div className="Transfer new">
      <a href={url}>
        <Address address={from} /> to <Address address={to} /> for {roundedValue} {symbol}
      </a>
    </div>
  );
}