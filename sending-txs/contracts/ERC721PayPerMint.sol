pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";

contract ERC721PayPerMint is ERC721, ERC721Enumerable, Ownable {
  using SafeMath for uint256;

  function exists(uint256 tokenId) public view returns (bool) {
    return _exists(tokenId);
  }

  function mint(address to, uint256 tokenId) public payable returns (bool) {
    require(msg.value >= tokenId.mul(1e12));
    _mint(to, tokenId);
    return true;
  }

  function withdraw() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }
}
