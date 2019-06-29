# Payment channels

Sample contracts, scripts, and DApp on payment channels.

## Contracts and scripts

There are three different payment channels in the `contracts` folder, compiled using `sol-compiler`:

- `PaymentChannel` is a unidirectional payment channel that handles payments in ETH
- `TokenPaymentChannel` is a unidirectional payment channel that handles payments in an ERC20
- `BidirectionalPaymentChannel` is a bidirectional payment channel that handles payments in ETH

On the `scripts` folder, there is sample code for interacting with each of the contracts. Start ganache via `ganache-cli -d` on a console, and run each script via `node scripts/unidirectional.js`, `node scripts/unidirectionalToken.js`, or `node scripts/bidirectional.js`.

## Sample DApp

The `src` folder contains a `create-react-app` that demoes the usage of a payment channel in a DApp. Unlike previous DApps, this one does not rely on metamask: instead, it interacts with the accounts communicating with the node directly.

To run this application, first install all dependencies in this package via `npm install`. Then start a new ganache instance via `ganache-cli`, optionally providing a `--blockTime` option. Start the react application via `npm start`, and navigate to `localhost:3000` in your browser.

This DApp contains two main views: one of a sender, and another of a recipient. Each view controls a different account, and they are meant to be opened in different tabs. They communicate behind the scenes using a `BroadcastChannel`. Use the sender view to open a channel and send microtransactions, and the recipient to close it and cash out.