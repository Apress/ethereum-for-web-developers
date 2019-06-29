pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract TokenPaymentChannel {
  using ECDSA for bytes32;

  address payable sender;
  address payable recipient;
  uint256 endTime;
  IERC20 token;

  constructor(address payable _recipient, uint256 _endTime, IERC20 _token) public {
    sender = msg.sender;
    recipient = _recipient;
    endTime = _endTime;
    token = _token;
  }

  // Force close by the sender
  function forceClose() public {
    require(now > endTime);
    require(msg.sender == sender);
    uint256 balance = token.balanceOf(address(this));
    token.transfer(sender, balance);
    selfdestruct(sender);
  }

  // Recipient can submit proof and cash out
  function close(uint256 value, bytes memory signature) public {
    require(msg.sender == recipient);
    
    bytes32 hash = keccak256(abi.encodePacked(value, address(this))).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(signer == sender);

    // Send earnings to recipient
    uint256 balance = token.balanceOf(address(this));
    uint256 toRecipient = balance < value ? balance : value;
    token.transfer(recipient, toRecipient);
    
    // Send remainder to sender
    if (toRecipient < balance) token.transfer(sender, balance - toRecipient);
    selfdestruct(sender);
  }
}