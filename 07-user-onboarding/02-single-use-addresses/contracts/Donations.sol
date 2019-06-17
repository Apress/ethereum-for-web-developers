pragma solidity ^0.5.0;

contract Donations {
  address payable wallet;
  
  event Donation(uint256 value, string text);

  constructor(address payable _wallet) public {
    wallet = _wallet;
  }
  
  function withdraw() external {
    require(msg.sender == wallet);
    wallet.transfer(address(this).balance);
  }
  
  function donate(string calldata text) external payable {
    require(msg.value > 0);
    emit Donation(msg.value, text);
  }
}