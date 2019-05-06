pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract BidirectionalPaymentChannel {
  using ECDSA for bytes32;

  uint256 constant closePeriod = 1 days;

  address payable p1;
  address payable p2;

  uint256 deposit1;
  uint256 deposit2;

  uint256 closeTime;
  uint256 closeNonce;
  int256  closeBalance;
  address closeRequestedBy;

  constructor(address payable _p1, address payable _p2) public {
    p1 = _p1;
    p2 = _p2;
  }

  function() external payable {
    if (msg.sender == p1) {
      deposit1 += msg.value;
    } else if (msg.sender == p2) {
      deposit2 += msg.value;
    } else {
      revert();
    }
  }

  // TODO: Handle a participant never sending a message
  function startClose(int256 balance, uint256 nonce, bytes memory signature) public {
    require(msg.sender == p1 || msg.sender == p2);
    require(closeTime == 0 || nonce > closeNonce);

    bytes32 hash = keccak256(abi.encodePacked(balance, nonce, address(this))).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(signer == p1 || signer == p2);
    require(signer != msg.sender);

    closeRequestedBy = msg.sender;
    closeTime = now;
    closeNonce = nonce;
    closeBalance = balance;
  }

  function confirmClose(uint256 nonce) public {
    require(msg.sender == p1 || msg.sender == p2);
    require(closeNonce == nonce);
    require(closeRequestedBy != msg.sender);

    executeClose();
  }

  function forceClose() public {
    require(msg.sender == p1 || msg.sender == p2);
    require(closeTime != 0 && closeTime + closePeriod > now);

    executeClose();
  }

  function executeClose() internal {
    uint256 funds = address(this).balance;
    address payable beneficiary;
    address payable payer;
    uint256 deposit;
    uint256 value;

    if (closeBalance > 0) {
      beneficiary = p1;
      payer = p2;
      deposit = deposit1;
      value = uint256(closeBalance);
    } else {
      beneficiary = p2;
      payer = p1;
      deposit = deposit2;
      value = uint256(-closeBalance);
    }

    uint256 toSend = value + deposit;
    beneficiary.transfer(toSend > funds ? funds : toSend);    
    selfdestruct(payer);
  }
}