const fs = require('fs');

// Retrieves a contract compiled with sol-compiler
module.exports = function Contract(web3, artifactNameOrPath, address) {
  const artifactPath = artifactNameOrPath.includes("/") 
    ? artifactNameOrPath 
    : `./artifacts/${artifactNameOrPath}.json`;
  const artifact = JSON.parse(fs.readFileSync(artifactPath));
  const data = artifact.compilerOutput.evm.bytecode.object;
  const abi = artifact.compilerOutput.abi;
  return new web3.eth.Contract(abi, address || null, { data, gas: 1e6 });
}