# Sidechain setup example

Sample setup for a proof-of-authority sidechain.

## Contracts

The contracts folder contains a `Bridge` contract used to connect the sidechain with another network, such as Rinkeby. This contract is to be deployed in both the sidechain and the remote network.

## Sidechain setup

The sidechain is set up via three `geth` nodes running a custom genesis JSON file, `mysidechain.json`. You can generate your own by running `puppeth` and following the instructions. You can also add extra nodes to join the network for testing.

## Scripts

The scripts folder contains three scripts:

- `deploy.js` is used to deploy the bridge contract, this needs to be run against both the sidechain and the main network.
- `watcher.js` is to be run once for each validator node, to watch each end of the bridge for lock operations.
- `lock.js` is used to lock funds in one end of the bridge as a user, what prompts the validators to unlock the corresponding funds on the other side.