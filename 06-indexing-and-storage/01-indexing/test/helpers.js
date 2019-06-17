const util = require('util');

function rpcSend(web3, method, ... params) {
  const id = parseInt(Math.random() * 1e9).toString();
  return util.promisify(web3.currentProvider.send).call(web3.currentProvider, {
    id, jsonrpc: "2.0", method, params
  });
}

function takeSnapshot(web3) {
  return rpcSend(web3, "evm_snapshot").then(r => r.result);
}

function revertToSnapshot(web3, id) {
  return rpcSend(web3, "evm_revert", id);
}

function mineBlocks(web3, length) {
  return Promise.all(
    Array.from({ length }, () => (
      rpcSend(web3, "evm_mine")
    ))
  );
}

module.exports = {
  takeSnapshot,
  revertToSnapshot,
  mineBlocks
}