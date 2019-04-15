pragma solidity ^0.5.0;

import "./Donations.sol";

contract DonateB {
  Donations donations;
  
  constructor(Donations _donations) public {
    donations = _donations;
  }
  
  function() external payable {
    donations.donateB.value(msg.value)();
  }
}