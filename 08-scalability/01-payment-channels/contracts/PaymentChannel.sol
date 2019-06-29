pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract PaymentChannel {
  using ECDSA for bytes32;

  address payable sender;
  address payable recipient;
  uint256 endTime;

  constructor(address payable _recipient, uint256 _endTime) public payable {
    sender = msg.sender;
    recipient = _recipient;
    endTime = _endTime;
  }

  // Can add funds at any time
  function() external payable { }

  // Force close by the sender
  function forceClose() public {
    require(now > endTime);
    require(msg.sender == sender);
    selfdestruct(sender);
  }

  // Recipient can submit proof and cash out
  function close(uint256 value, bytes memory signature) public {
    require(msg.sender == recipient);
    
    bytes32 hash = keccak256(abi.encodePacked(value, address(this))).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(signer == sender);

    uint256 funds = address(this).balance;
    recipient.transfer(funds < value ? funds : value);
    selfdestruct(sender);
  }
}