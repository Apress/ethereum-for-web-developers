pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract BidirectionalPaymentChannel {
  using ECDSA for bytes32;

  uint256 constant closePeriod = 1 days;

  address payable user1;
  address payable user2;

  uint256 balance1;
  uint256 balance2;
  uint256 lastNonce;  

  uint256 closeTime;
  address closeRequestedBy;

  constructor(address payable _user2) public payable {
    balance1 = msg.value;
    user1 = msg.sender;
    user2 = _user2;
  }

  function join() public payable {
    require(msg.sender == user2 && balance2 == 0);
    balance2 = msg.value;
  }

  modifier onlyParticipant() {
    require(msg.sender == user1 || msg.sender == user2);
    _;
  }

  function close() onlyParticipant public {
    require(closeTime == 0);
    closeRequestedBy = msg.sender;
    closeTime = now;
  }

  function closeWithState(uint256 newBalance1, uint256 newBalance2, uint256 nonce, bytes memory signature) onlyParticipant public {
    require(nonce > lastNonce);
    require(newBalance1 + newBalance2 == address(this).balance);
    
    bytes32 hash = keccak256(abi.encodePacked(newBalance1, newBalance2, nonce, address(this))).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(signer == user1 || signer == user2, "Signer must be one of the participants");
    require(signer != msg.sender, "Signer must not be sender");

    balance1 = newBalance1;
    balance2 = newBalance2;
    lastNonce = nonce;
    
    closeRequestedBy = msg.sender;
    closeTime = now;
  }

  function confirmClose() onlyParticipant public {
    bool challengeEnded = closeTime != 0 && closeTime + closePeriod > now;
    require(closeRequestedBy != msg.sender || challengeEnded);

    user1.transfer(balance1);
    user2.transfer(balance2);
    selfdestruct(user1);
  }
}