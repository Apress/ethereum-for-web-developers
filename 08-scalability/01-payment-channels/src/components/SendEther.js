import React from 'react';
import BN from 'bignumber.js'

class SendEther extends React.Component {
  constructor(props) {
    super(props);
    this.handleSend = this.handleSend.bind(this);
    this.valueInput = React.createRef();
  }

  async handleSend(e) {
    e.preventDefault();
    const value = BN(this.valueInput.current.value).shiftedBy(18);
    this.props.onSend(value);
  }

  render() {
    return (
      <div>
        <h3>Send micropayment</h3>
        <p>
          <label>Value in ETH: </label>
          <input style={{ width: 60 }} type="number" ref={this.valueInput} defaultValue={0.1}></input>
          <button onClick={this.handleSend}>Send</button>
        </p>
      </div>
    );
  }
}

export default SendEther;