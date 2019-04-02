pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract ERC721WithNativeMetaTxs is ERC721 {
  using ECDSA for bytes32;

  mapping (address => uint256) nonces;

  // Convenience function to allow minting by anyone
  function mint(address to, uint256 tokenId) public {
    return _mint(to, tokenId);
  }

  function signedTransferFrom(address from, address to, uint256 tokenId, uint256 nonce, bytes memory signature) public {
    bytes32 hash = getTransferHash(from, to, tokenId, nonce).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(_isApprovedOrOwner(signer, tokenId));
    require(nonce == nonces[signer]);
    nonces[signer]++;
    _transferFrom(from, to, tokenId);
  }

  // Calculates the hash to be signed for a meta-transaction
  function getTransferHash(address from, address to, uint256 tokenId, uint256 nonce) public view returns (bytes32) {
    return keccak256(abi.encodePacked(from, to, tokenId, nonce, address(this)));
  }
}