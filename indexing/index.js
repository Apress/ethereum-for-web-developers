const Indexer = require('./indexer');
const express = require('express')
const mapValues = require('lodash.mapvalues');

const PORT = 3000;

function main () {
  const app = express()
  const indexer = new Indexer();

  app.get('/balances.json', (_req, res) => {
    res.send(
      mapValues(indexer.getBalances(), b => b.toString(10))
    );
  });

  app.get('/block.json', (_req, res) => {
    res.send({ block: indexer.getLastBlock() });
  })

  app.listen(PORT);
  indexer.start();
};

main();