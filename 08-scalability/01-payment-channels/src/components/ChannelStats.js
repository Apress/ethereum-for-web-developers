import React from 'react';
import { toEth } from '../eth/utils';

class ChannelStats extends React.Component {
  render() {
    const { address, transferred, deposit, isRecipient } = this.props;
    const verb = isRecipient ? "Received" : "Sent";
    return (
      <div>
        <h3>Channel</h3>
        <p>Deployed at {address}</p>
        <p>Deposit of {toEth(deposit)}</p>
        <p>{verb} {toEth(transferred)}</p>
      </div>
    );
  }
}

export default ChannelStats;