pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "./Identity.sol";

contract IdentityWithMetaTxs is Identity {
  using ECDSA for bytes32;

  uint256 public nonce;

  constructor(address owner) Identity(owner) public payable { }

  // Forward arbitrary calls and funds to a third party
  function forward(address to, uint256 value, bytes memory data, bytes memory signature) public returns (bytes memory) {
    bytes32 hash = getHash(to, value, data).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(accounts[signer], "Signer is not a registered account");
    nonce++;
    (bool success, bytes memory returnData) = to.call.value(value)(data);
    require(success, "Forwarded call failed");
    return returnData;
  }

  // Calculates the hash to be signed for a meta-transaction
  function getHash(address to, uint256 value, bytes memory data) public view returns (bytes32) {
    return keccak256(abi.encodePacked(to, value, data, nonce, address(this)));
  }
}