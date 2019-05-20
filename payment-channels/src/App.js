import React from 'react';
import './App.css';
import Sender from './components/Sender';
import { getWeb3 } from './eth/network';
import Recipient from './components/Recipient';

const SENDER = '0xffcf8fdee72ac11b5c542428b35eef5769c409f0';
const SENDER_PK = '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1';
const RECIPIENT = '0x22d491bde2303f2f43325b2108d26f1eaba1e32b';

class App extends React.Component {
  getContents() {
    const props = {
      web3: getWeb3(),
      sender: SENDER,
      recipient: RECIPIENT
    };

    switch (window.location.pathname) {
      case "/sender": 
        return (<Sender senderPk={SENDER_PK} {... props} />);
      case "/recipient": 
        return (<Recipient {... props} />);
      default: 
        return (<h1>
          <a href="/sender">Sender</a> | <a href="/recipient">Recipient</a>
        </h1>);
    }
  }

  render() {
    return (
      <div className="App">
        { this.getContents() }
      </div>
    );
  }
}

export default App;
