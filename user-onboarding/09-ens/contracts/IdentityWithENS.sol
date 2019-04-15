pragma solidity ^0.5.0;

import "@ensdomains/ens/contracts/ENS.sol";
import "@ensdomains/ens/contracts/FIFSRegistrar.sol";
import "@ensdomains/resolver/contracts/PublicResolver.sol";

import "./Identity.sol";

contract IdentityWithENS is Identity {
  constructor(address owner) 
    Identity(owner) public payable {
  }

  // Code adapted from https://github.com/UniversalLogin/UniversalLoginSDK/blob/02025571ff8c1f256d47e2e96bbcfda6f4a412c2/universal-login-contracts/contracts/ENSRegistered.sol
  function registerENS(bytes32 _hashLabel, bytes32 _node, ENS ens, FIFSRegistrar registrar, PublicResolver resolver) onlyUserAccount public {
    registrar.register(_hashLabel, address(this));
    ens.setResolver(_node, address(resolver));
    resolver.setAddr(_node, address(this));
  }
}
