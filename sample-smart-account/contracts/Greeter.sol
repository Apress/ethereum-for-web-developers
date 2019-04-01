pragma solidity ^0.5.0;

contract Greeter {
  string private greeting;
  event GreetingSet(string greeting, uint256 paid);

  constructor(string memory _greeting) public {
    greeting = _greeting;
    emit GreetingSet(_greeting, 0);
  }

  function greet() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public payable returns (string memory, uint256) {
    require(msg.value > 1000);
    greeting = _greeting;
    emit GreetingSet(_greeting, msg.value);
    return (_greeting, address(this).balance);
  }
}