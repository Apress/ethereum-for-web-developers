import React from 'react';
import PaymentChannel, { signPayment } from '../contracts/PaymentChannel';
import CreateChannel from './CreateChannel';
import BN from 'bignumber.js';
import ChannelStats from './ChannelStats';
import SendEther from './SendEther';
import { toEth } from '../eth/utils';

class Sender extends React.Component {
  constructor(props) {
    super(props);
    this.deployChannel = this.deployChannel.bind(this);
    this.sendEth = this.sendEth.bind(this);
  }

  componentWillMount() {
    // Sample p2p connection using a broadcast channel
    this.setState({ p2p: new BroadcastChannel('payments') });
  }

  sendEth(value) {
    const { web3, senderPk } = this.props;
    const { sent, channel, p2p } = this.state;

    const newSent = sent.plus(value);
    const signature = signPayment(
      web3, newSent, channel.options.address, senderPk
    );

    p2p.postMessage({ action: "PAYMENT", sent: newSent.toString(), signature });
    console.log(`Sent signed message for ${toEth(newSent)} (${signature})`);
    this.setState({ sent: newSent });
  }

  async deployChannel(deposit) {
    const { web3, sender, recipient } = this.props;
    const { p2p } = this.state;

    const endTime = +(new Date()) +(30 * 1000);
    const channel = await PaymentChannel(web3)
      .deploy({ arguments: [recipient, endTime] })
      .send({ value: deposit.toString(), from: sender, gas: 1e6 });
    
    const address = channel.options.address;
    p2p.postMessage({ action: "CHANNEL_DEPLOYED", address, deposit: deposit.toString() });
    console.log(`Deployed channel at ${address}`);
    
    this.setState({ 
      channel, 
      deposit,
      sent: BN(0)
    });
  }

  render() {
    const { channel, sent, deposit } = this.state;
    return channel 
      ? (<div>
        <h1>Sender</h1>
        <ChannelStats address={channel.options.address} transferred={sent} deposit={deposit} />
        <SendEther onSend={this.sendEth} />
      </div>)
      : (<div>
        <h1>Sender</h1>
        <CreateChannel onDeploy={this.deployChannel} />
      </div>);
  }
}

export default Sender;
