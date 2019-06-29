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
    this.state = {};
    this.deployChannel = this.deployChannel.bind(this);
    this.sendEth = this.sendEth.bind(this);
    this.broadcastChannel = new BroadcastChannel('payments');
  }

  async sendEth(value) {
    const { web3, sender } = this.props;
    const { sent, channel } = this.state;

    const newSent = sent.plus(value);
    const signature = await signPayment(
      web3, newSent, channel.options.address, sender
    );

    this.broadcastChannel.postMessage({ action: "PAYMENT", sent: newSent.toString(), signature });
    console.log(`Sent signed message for ${toEth(newSent)} (${signature})`);
    this.setState({ sent: newSent });
  }

  async deployChannel(deposit) {
    const { web3, sender, recipient } = this.props;

    const endTime = +(new Date()) +(300 * 1000);
    const channel = await PaymentChannel(web3)
      .deploy({ arguments: [recipient, endTime] })
      .send({ value: deposit.toString(), from: sender, gas: 1e6 });
    
    const address = channel.options.address;
    this.broadcastChannel.postMessage({ action: "CHANNEL_DEPLOYED", address });
    console.log(`Deployed channel at ${address}`);
    
    this.setState({ 
      channel, 
      deposit,
      sent: BN(0)
    });
  }

  render() {
    const { channel, sent, deposit } = this.state;
    const { sender } = this.props;
    const content = channel 
      ? (<div>
          <ChannelStats address={channel.options.address} transferred={sent} deposit={deposit} />
          <SendEther onSend={this.sendEth} />
        </div>)
      : (<CreateChannel onDeploy={this.deployChannel} />);
    return (<div>
      <h1>Sender</h1>
      <p>{sender}</p>
      {content}
    </div>);
  }
}

export default Sender;
