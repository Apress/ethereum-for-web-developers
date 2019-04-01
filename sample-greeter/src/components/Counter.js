import React, { Component } from 'react';
import './Counter.css';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      value: null, 
      error: null,
      increasing: false
    };
  }

  increaseCounter() {
    const counter  = this.props.contract;
    this.setState({ increasing: true, error: null });
    
    return counter.methods.increase().send()
      .on('receipt', () => {
        this.setState({ increasing: false })
      })
      .on('error', (error) => {
        this.setState({ increasing: false, error })
      });
  }

  async componentDidMount() {
    const counter = this.props.contract;
      
    const initialValue = await counter.methods.value().call();
    this.setState({ value: initialValue });

    counter.events.Increased()
      .on('data', (event) => {
        const value = event.returnValues.newValue;
        this.setState({ value });
      });
  }

  render() {
    const { value, increasing, error } = this.state;
    const { contract } = this.props;
    if (!value) return "Loading";

    return (
      <div className="Counter">
        <div>
          Counter value: { value.toString() }
        </div>
        <div className="Counter-address">Address: { contract.options.address }</div>
        <button disabled={!!increasing} onClick={() => this.increaseCounter()}>
          Increase counter
        </button>
        <div className="Counter-notifications">
          <div>{ increasing && "Awaiting transaction" }</div>
          <div>{ error && error.message }</div>
        </div>
      </div>
    );
  }
}

export default Counter;