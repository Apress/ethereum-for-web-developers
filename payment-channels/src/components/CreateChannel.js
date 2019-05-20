import React from 'react';
import BN from 'bignumber.js';

class CreateChannel extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeploy = this.handleDeploy.bind(this);
    this.depositInput = React.createRef();
    this.state = { deploying: false }; 
  }

  handleDeploy(e) {
    e.preventDefault();
    const deposit = BN(this.depositInput.current.value).shiftedBy(18);
    this.setState({ deploying: true });
    this.props.onDeploy(deposit);
  }

  render () {
    return (
      <div>
        <h3>Deploy payment channel</h3>
        <p>
          <label>Deposit in ETH: </label>
          <input type="number" ref={this.depositInput} defaultValue={1}></input>
          <button disabled={this.state.deploying} onClick={this.handleDeploy}>Deploy</button>
        </p>
      </div>
    );
  }
}

export default CreateChannel;