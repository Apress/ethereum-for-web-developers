const util = require('util');

function rpcSend(web3, method, ... params) {
  return util.promisify(web3.currentProvider.send).call(web3.currentProvider, {
    jsonrpc: "2.0", method, params
  });
}

function takeSnapshot(web3) {
  return rpcSend(web3, "evm_snapshot");
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