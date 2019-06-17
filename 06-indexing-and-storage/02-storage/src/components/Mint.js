import React, { Component, createRef } from 'react';

export default class Mint extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleMint = this.handleMint.bind(this);
    this.titleInput = createRef();
    this.descriptionInput = createRef();
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
    this.props.mint({ 
      value: this.state.value,
      title: this.titleInput.current.value,
      description: this.descriptionInput.current.value,
    });
    this.setState({ 
      value: "",
      mintable: false 
    });

    this.titleInput.current.value = "";
    this.descriptionInput.current.value = "";
  }

  render() {
    const { value, mintable } = this.state;
    return (
      <form onSubmit={this.handleMint}>
        <p>
          <label>
            Value:
            <input type="numeric" value={value} onChange={this.handleChange} />
          </label>
        </p>
        <p>
          <label>
            Title:
            <input type="text" ref={this.titleInput} />
          </label>
        </p>
        <p>
          <label>
            Description:
            <input type="text" ref={this.descriptionInput} />
          </label>
        </p>
        <p>
          <button disabled={!mintable}>Create</button>
        </p>
      </form>
    );
  }
}