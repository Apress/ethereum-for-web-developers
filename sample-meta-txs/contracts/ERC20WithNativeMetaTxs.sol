pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

// Code based on MetaCoin by Austin Griffith
// https://github.com/austintgriffith/native-meta-transactions/blob/6e1efc041ecf7e1665b5b0e986505c2598a86add/contracts/MetaCoin/MetaCoin.sol

contract ERC20WithNativeMetaTxs is ERC20 {
  using ECDSA for bytes32;

  mapping (address => uint256) nonces;

  constructor(address initialHolder, uint256 initialSupply) public {
    _mint(initialHolder, initialSupply);
  }

  function signedTransfer(address to, uint256 value, uint256 reward, uint256 nonce, bytes memory signature) public {
    bytes32 hash = getTransferHash(to, value, nonce, reward).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(nonce == nonces[signer]);
    nonces[signer]++;
    _transfer(signer, msg.sender, reward);
    _transfer(signer, to, value);
  }

  // Calculates the hash to be signed for a meta-transaction
  function getTransferHash(address to, uint256 value, uint256 nonce, uint256 reward) public view returns (bytes32) {
    return keccak256(abi.encodePacked(to, value, nonce, reward, address(this)));
  }
}