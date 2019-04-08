pragma solidity ^0.5.0;

contract UpgradeableIdentity {
  address private implementation;
  bool private initialized;
  
  // Initializer function instead of constructor
  function initialize(address owner) public payable {
    require(!initialized);
    initialized = true;
    accounts[owner] = true;
    emit AccountAdded(owner);
  }

  // Upgrades to a new implementation
  function upgradeTo(address newImplementation) onlyUserAccount public {
    implementation = newImplementation;
  }

  mapping(address => bool) public accounts;

  event AccountAdded(address indexed account);
  event AccountRemoved(address indexed account);

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

  function forward(address to, uint256 value, bytes memory data) onlyUserAccount public returns (bytes memory) {
    (bool success, bytes memory returnData) = to.call.value(value)(data);
    require(success, "Forwarded call failed");
    return returnData;
  }

  // Empty fallback function to accept deposits
  function() external payable { }
}
