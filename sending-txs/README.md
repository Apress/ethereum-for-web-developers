# Sending txs

Sample app for sending transactions for minting ERC721s using plain web3 1.0 based on create-react-app.

To run this application, first install all dependencies via `npm install`. Then start a new ganache instance via `ganache-cli`, optionally providing a `--blockTime` option, and run `node scripts/deploy.js` to deploy a new ERC721 contract.

Once deployed, start the react application via `npm start`, and navigate to `localhost:3000` in your browser. Unlock metamask, connecting to `localhost:8545`.
