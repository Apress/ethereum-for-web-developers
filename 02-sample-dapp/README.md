# Sample DApp

Sample DApp project using plain web3 1.0 based on create-react-app.

To run this application, first install all dependencies in this package via `npm install`. Then start a new ganache instance via `ganache-cli`, optionally providing a `--blockTime` option, and run `node scripts/deploy.js` to deploy a new ERC721 contract.

Once deployed, start the react application via `npm start`, and navigate to `localhost:3000` in your browser. Unlock metamask, connecting to `localhost:8545`. Make sure to fund your metamask account to interact with the application.

You can also run tests with `./scripts/test.sh`.