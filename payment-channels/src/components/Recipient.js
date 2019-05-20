import React from 'react';
import PaymentChannel, { recoverPayment } from '../contracts/PaymentChannel';
import BN from 'bignumber.js';
import ChannelStats from './ChannelStats';
import { toEth, areAddressesEqual } from '../eth/utils';

class Recipient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.closeChannel = this.closeChannel.bind(this);
    this.p2p = new BroadcastChannel('payments');
    this.p2p.onmessage = (evt) => this.handleMessage(evt.data);
  }

  async componentWillMount() {
    const { web3, recipient } = this.props;
    const balance = BN(await web3.eth.getBalance(recipient));
    this.setState({ balance });
  }

  handleMessage(data) {
    const action = data.action;
    switch (action) {
      
      case "CHANNEL_DEPLOYED":
        console.log(`Channel opened at ${data.address} with deposit of ${toEth(data.deposit)}`);
        this.setState({ 
          channel: PaymentChannel(this.props.web3, data.address), 
          deposit: BN(data.deposit), 
          received: BN(0) 
        });
        break;
      
      case "PAYMENT":
        console.log(`Payment messaged received for a total of ${toEth(data.sent)}`);
        if (this.verifyMessage(data)) {
          this.setState({ 
            received: BN(data.sent),
            signature: data.signature
          });
        }
        break;

      default:
        console.error("Unexpected message", data);
    }
  }

  verifyMessage(data) {
    const { web3, sender } = this.props;
    const { channel } = this.state;
    const signer = recoverPayment(web3, data.sent, channel.options.address, data.signature);
    if (!areAddressesEqual(signer, sender)) {
      console.error("Invalid payment message received")
      return false;
    }
    return true;
  }

  async closeChannel() {
    const { web3, recipient } = this.props;
    const { channel, signature, received } = this.state;
    await channel.methods.close(received.toString(), signature).send({ from: recipient });
    console.log(`Closed channel for ${toEth(received)}`)
    const balance = BN(await web3.eth.getBalance(recipient));
    this.setState({ channel: null, balance });
  }

  render() {
    const { channel, received, deposit, balance } = this.state;
    const { recipient } = this.props;

    const content = channel
      ? (<div>
        <ChannelStats address={channel.options.address} transferred={received} deposit={deposit} isRecipient={true} />
        <button onClick={this.closeChannel}>Close channel</button>
        </div>)
      : (<p>Awaiting channel opening...</p>);

    return (<div>
        <h1>Recipient</h1>
        <p>{recipient}</p>
        <p>Balance: {balance ? toEth(balance) : '...'}</p>
        {content}
      </div>);
  }
}

export default Recipient;
