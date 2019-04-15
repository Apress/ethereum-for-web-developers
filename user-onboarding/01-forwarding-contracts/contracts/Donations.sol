pragma solidity ^0.5.0;

contract Donations {
  uint256 fundsA;
  uint256 fundsB;
  
  uint256 timeEnd;
  address payable walletA;
  address payable walletB;
  
  constructor(
      uint256 _timeEnd, 
      address payable _walletA, 
      address payable _walletB) public {
    timeEnd = _timeEnd;
    walletA = _walletA;
    walletB = _walletB;
  }
  
  function donateA() external payable {
    require(now <= timeEnd && msg.value > 0);
    fundsA += msg.value;
  }

  function donateB() external payable {
    require(now <= timeEnd && msg.value > 0);
    fundsB += msg.value;
  }

  function finish() external {
    require(now > timeEnd && fundsA != fundsB);
    address payable winner 
      = (fundsA > fundsB) ? walletA : walletB;
    winner.transfer(fundsA + fundsB);
  }
}