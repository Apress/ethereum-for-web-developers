pragma solidity ^0.5.0;

import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/ens/contracts/FIFSRegistrar.sol";
import "@ensdomains/resolver/contracts/PublicResolver.sol";

contract IdentityWithENS {
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

  // Code adapted from https://github.com/UniversalLogin/UniversalLoginSDK/blob/02025571ff8c1f256d47e2e96bbcfda6f4a412c2/universal-login-contracts/contracts/ENSRegistered.sol
  function registerENS(bytes32 _hashLabel, bytes32 _node, ENS ens, FIFSRegistrar registrar, PublicResolver resolver) onlyUserAccount public {
    registrar.register(_hashLabel, address(this));
    ens.setResolver(_node, address(resolver));
    resolver.setAddr(_node, address(this));
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
