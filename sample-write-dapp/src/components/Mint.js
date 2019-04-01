import React, { Component } from 'react';

export default class Mint extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleMint = this.handleMint.bind(this);
  }

  async handleChange(event) {
    const value = event.target.value;
    this.setState({ value });
    
    if (value && value.length > 0) {
      const mintable = await this.props.canMint(value);
      if (value === this.state.value) this.setState({ mintable });
    } else {
      this.setState({ mintable: false });
    }
  }

  async handleMint(event) {
    event.preventDefault();
    this.props.mint(this.state.value);
    this.setState({ value: "", mintable: false });
  }

  render() {
    const { value, mintable } = this.state;
    return (
      <form onSubmit={this.handleMint}>
        <input type="numeric" value={value} onChange={this.handleChange} />
        <button disabled={!mintable}>Create</button>
      </form>
    );
  }
}