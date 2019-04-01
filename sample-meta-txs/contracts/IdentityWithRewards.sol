pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

pragma solidity ^0.5.0;

contract IdentityWithRewards {
  using ECDSA for bytes32;

  mapping(address => bool) public accounts;
  uint256 public nonce;

  event AccountAdded(address indexed account);
  event AccountRemoved(address indexed account);

  event Forwarded(uint256 nonce, bool success, address relayer);

  constructor(address owner) public payable {
    accounts[owner] = true;
    emit AccountAdded(owner);
  }

  modifier onlyUserAccount {
    require(accounts[msg.sender], "Sender is not recognized");
    _;
  }

  function addAccount(address newAccount) onlyUserAccount public {
    accounts[newAccount] = true;
    emit AccountAdded(newAccount);
  }

  function removeAccount(address toRemove) onlyUserAccount public {
    accounts[toRemove] = false;
    emit AccountRemoved(toRemove);
  }

// Forward arbitrary calls and funds to a third party
function forward(uint256 reward, uint256 gasPrice, uint256 gasLimit, address to, uint256 value, bytes memory data, bytes memory signature) public returns (bytes memory) {
  require(tx.gasprice >= gasPrice, "Gas price is below requested");
  bytes32 hash = getHash(reward, gasPrice, gasLimit, to, value, data).toEthSignedMessageHash();
  address signer = hash.recover(signature);
  require(accounts[signer], "Signer is not a registered account");
  nonce++;
  (bool success, bytes memory returnData) = to.call.value(value).gas(gasLimit)(data);
  emit Forwarded(nonce, success, msg.sender);
  msg.sender.transfer(reward);
  return returnData;
}

// Calculates the hash to be signed for a meta-transaction
function getHash(uint256 reward, uint256 gasPrice, uint256 gasLimit, address to, uint256 value, bytes memory data) public view returns (bytes32) {
  return keccak256(abi.encodePacked(reward, gasPrice, gasLimit, to, value, data, nonce, address(this)));
}

  // Empty fallback function to accept deposits
  function() external payable { }
}