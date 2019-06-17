pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor () public { }
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}