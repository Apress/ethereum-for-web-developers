pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract SampleToken is ERC20 {
  constructor(address initialHolder, uint256 initialSupply) public {
    _mint(initialHolder, initialSupply);
  }
}