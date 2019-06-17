# Sample ERC20 indexer

Sample script for indexing Transfer events of an ERC20 token on mainnet, and creating a local list of holders to be queried via an HTTP interface.

This folder contains three different implementations:
- `simple-indexer`: uses polling and awaits a given number of confirmations before processing a transfer
- `subs-indexer`: uses subscriptions for registering new events as well as reorgs
- `reorgs-indexer`: uses polling and manually handles reorgs

The entry point is the `index.js` file. Make sure to replace the `API_TOKEN` variable with a valid Infura API token, or use a different provider to connect to mainnet.

```
$ node index.js 
Blocks 6563801-7978331
 Batch 6563801-6663800
  0xfbb8b5f7cf354d08cb9751363a4d961b8ba620ca4b54e57196b461604afb210e#19: 0x0000000000000000000000000000000000000000 => 0xB048fb85aee554d26d11F65A67412923FAfce082 (100000000000000000000000000)
  0xbdb8837157b734e52421c6a9c92172e2e6c1eefc5363b5a94909bf9131c69365#23: 0xB048fb85aee554d26d11F65A67412923FAfce082 => 0x58b2f26c213438cBD61243d4B4cc732C03a88356 (84227993000000000000000000)
  0xe9e1855576cd6c8300b26e831acf6011e6301944bc740cff6ff0562ac20dd579#2: 0xB048fb85aee554d26d11F65A67412923FAfce082 => 0x352B3D4C7700FCB6335464783654b4B4FC7f7945 (4666667000000000000000000)
...
```

Once started, you can query `http://localhost:3000/balances.json` to get the aggregated token balances.
```
$ curl -s 'http://localhost:3000/balances.json' | jq .
{
  "0xB048fb85aee554d26d11F65A67412923FAfce082": "26000000000000000000000",
  "0x58b2f26c213438cBD61243d4B4cc732C03a88356": "77997707535390983471493397",
  "0x352B3D4C7700FCB6335464783654b4B4FC7f7945": "4666667000000000000000000",
  "0xBC96734Ea73742344754CC233f2E411D853e68e7": "3000000000000000000000000",
  "0x15E21eAEF74D788EB60b4210b28a4135592b1a0E": "1000000000000000000000000",
  ...
}
```

To run the unit tests on this sample, start a ganache instance on port 9545 via `ganache-cli -p 9545`, and on a different terminal run `npm test`.

```
$ npm t

  indexer
    ✓ records balances from minting (95ms)
    ✓ records balances from transfer (144ms)
    ✓ updates previous balances (141ms)
    ✓ ignores unconfirmed transfers (102ms)
    ✓ handles reorganizations (273ms)

  5 passing (972ms)
```