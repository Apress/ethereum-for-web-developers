pragma solidity ^0.5.0;

contract Bridge {

  uint256 lastId;
  uint256 threshold;
  mapping(address => bool) validators;
  mapping(uint256 => Request) requests;

  struct Request {
    uint256 amount;
    address payable recipient;
    bool paid;
    uint256 approveCount;
    mapping(address => bool) approvedBy;
  }

  event Locked(uint256 id, uint256 amount, address recipient);
  event Unlocked(uint256 id, uint256 amount, address payable recipient);

  constructor(uint256 _threshold, address[] memory _validators) public {
    threshold = _threshold;
    for (uint256 i = 0; i < _validators.length; i++) {
      validators[_validators[i]] = true;
    }
  }

  function lock(address recipient) public payable {
    require(msg.value > 0);
    emit Locked(++lastId, msg.value, recipient);
  }

  function unlock(uint256 id, uint256 amount, address payable recipient) public {
    Request storage request = requests[id];
    require(validators[msg.sender], "Unlock must be called by a validator");
    require(!request.approvedBy[msg.sender], "Validator already approved this request");
    require(request.recipient == address(0) || request.recipient == recipient, "Recipient does not match");
    require(request.amount == 0 || request.amount == amount, "Amount does not match");
    
    request.approveCount++;
    request.approvedBy[msg.sender] = true;
    request.recipient = recipient;
    request.amount = amount;

    if (request.approveCount >= threshold && !request.paid) {
      request.paid = true;
      recipient.transfer(amount);
      emit Unlocked(id, amount, recipient);
    }
  }

  function() payable external {}
}