# Storage

Sample app for handling off-chain storage. Built upon the _send-transactions_ example.

To run this application, first install all dependencies via `npm install`. Then start a new ganache instance via `ganache-cli`, optionally providing a `--blockTime` option, and run `node scripts/deploy.js` to deploy a new ERC721 contract.

If using local storage, then make sure to start the backend server in port 3010 via `npm run server`.

Then, start the react application via `npm start`, and navigate to `localhost:3000` in your browser. Unlock metamask, connecting to `localhost:8545`.
