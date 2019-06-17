pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";

contract ERC721PayPerMint is ERC721, ERC721Enumerable, ERC721Metadata, Ownable {
  using SafeMath for uint256;

  constructor() public
    ERC721Metadata("PayPerMint", "PPM") { }

  function exists(uint256 tokenId) public view returns (bool) {
    return _exists(tokenId);
  }

  function mint(address to, uint256 tokenId, string memory tokenURI) public payable returns (bool) {
    require(msg.value >= tokenId.mul(1e12));
    _mint(to, tokenId);
    _setTokenURI(tokenId, tokenURI);
    return true;
  }

  function withdraw() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }
}
