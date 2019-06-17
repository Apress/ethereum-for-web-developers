const Indexer = require('./reorgs-indexer');
const express = require('express')
const mapValues = require('lodash.mapvalues');

const API_TOKEN = 'YOUR_INFURA_API_TOKEN';
const PORT = 3000;
const PROVIDER = 'https://mainnet.infura.io/v3/' + API_TOKEN;
const DEBUG = true;

const ADDRESS = '0x00fdae9174357424a78afaad98da36fd66dd9e03';
const START_BLOCK = 6563800;
const BATCH_SIZE = 100000;

// const ADDRESS = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";
// const START_BLOCK = 4752007;
// const BATCH_SIZE = 100;

// const ADDRESS = '0x1985365e9f78359a9B6AD760e32412f4a445E862';
// const START_BLOCK = 5926311;
// const BATCH_SIZE = 1000;

function main () {
  const app = express()
  const indexer = new Indexer({ 
    address: ADDRESS, 
    startBlock: START_BLOCK, 
    provider: PROVIDER, 
    debug: DEBUG,
    batchSize: BATCH_SIZE
  });

  app.get('/balances.json', (_req, res) => {
    res.send(
      mapValues(indexer.getBalances(), b => b.toString(10))
    );
  });

  app.listen(PORT);
  indexer.start();
};

main();