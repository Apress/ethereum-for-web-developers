pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract Signatures {
  using ECDSA for bytes32;

  function recover(string memory message, bytes memory signature) public pure returns (address) {
    bytes32 hash = keccak256(bytes(message));
    return hash.toEthSignedMessageHash().recover(signature);
  }
}