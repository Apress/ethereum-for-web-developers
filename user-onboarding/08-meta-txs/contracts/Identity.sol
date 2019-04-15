pragma solidity ^0.5.0;

contract Identity {
  mapping(address => bool) public accounts;

  event AccountAdded(address indexed account);
  event AccountRemoved(address indexed account);

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
  function forward(address to, uint256 value, bytes memory data) onlyUserAccount public returns (bytes memory) {
    (bool success, bytes memory returnData) = to.call.value(value)(data);
    require(success, "Forwarded call failed");
    return returnData;
  }

  // Empty fallback function to accept deposits
  function() external payable { }
}