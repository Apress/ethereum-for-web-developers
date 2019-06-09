pragma solidity ^0.5.0;

contract Balances {
    mapping(address => uint256) public balances;

    event Deposit(address indexed beneficiary, uint256 value);
    event Withdraw(address indexed recipient, uint256 value);

    function deposit(address beneficiary) public payable {
      balances[beneficiary] = balances[beneficiary] + msg.value;
      emit Deposit(beneficiary, msg.value);
    }

    function withdraw(address payable recipient, uint256 value) public {
      require(value >= balances[msg.sender]);
      balances[msg.sender] = balances[msg.sender] - value;
      recipient.transfer(value);
      emit Withdraw(recipient, value);
    }

    function() public payable {
      deposit(msg.sender);
    }
}
