import React, { Component } from 'react';
import { getWeb3 } from '../eth/network';
import { getLogId } from '../utils/logs';
import Transfer from './Transfer';
import "./Transfers.css";

export default class Transfers extends Component {
  state = {
    transfers: [],
    eventSub: null,
    blockSub: null,
    loading: true
  };

  async componentDidMount() {
    const { contract } = this.props;
    
    // Load current block and subscribe to transfers starting from the next
    const blockNumber = await getWeb3().eth.getBlockNumber();
    this.setState({ blockNumber });
    this.subscribe(contract, blockNumber + 1);

    // Subscribe to new block headers
    this.subscribeBlockHeaders();
      
    // Load all transfers from the past N blocks to seed the list
    const pastEvents = await contract.getPastEvents('Transfer', {
      fromBlock: blockNumber - 1000, 
      toBlock: blockNumber 
    });

    // Load them into state at the end
    this.setState(state => ({
      ...state,
      loading: false,
      transfers: [...state.transfers, ...pastEvents.reverse()]
    }));
  }

  subscribe(contract, fromBlock) {
    // Subscribe to all new transfer events
    const eventSub = contract.events.Transfer({ fromBlock })
      .on('data', (event) => {
        this.setState(state => ({
          ...state,
          transfers: [event, ...state.transfers]
        }));
      })
      .on('changed', (event) => {
        this.setState(state => ({
          ...state,
          transfers: state.transfers.filter(t => 
            t.transactionHash !== event.transactionHash || t.logIndex !== event.logIndex
          )
        }))
      })
      .on('error', (error) => {
        this.setState({ error })
      });

    // Save the subscription in state so we can later unsubscribe
    this.setState({ eventSub });
  }

  subscribeBlockHeaders() {
    const blockSub = getWeb3().eth.subscribe('newBlockHeaders')
      .on('data', ({ number }) => {
        if (number) {
          this.setState({ blockNumber: number});
        }
      });  
    this.setState({ blockSub });
  }

  componentWillUnmount() {
    // Unsubscribe from the event upon unmount
    const { eventSub, blockSub } = this.state;
    if (eventSub) eventSub.unsubscribe();
    if (blockSub) blockSub.unsubscribe();
  }

  render() {
    const { error, loading, transfers, blockNumber } = this.state;
    const { decimals, symbol } = this.props;

    if (loading) return "Loading...";
    if (error) return "Error retrieving transfers";
    
    const confirmedTransfers = transfers.filter((transfer) => (
      blockNumber - transfer.blockNumber > 12
    ));

    return (<div className="Transfers">
      { confirmedTransfers.map(transfer => (
        <Transfer 
          key={getLogId(transfer)} 
          transfer={transfer} 
          decimals={decimals}
          symbol={symbol} />
      )) }
    </div>)
  }
}