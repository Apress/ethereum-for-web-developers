pragma solidity ^0.5.0;

import "./UpgradeableIdentity.sol";

contract UpgradeableIdentityV2 is UpgradeableIdentity {
  function echo(string memory text) public pure returns (string memory) {
    return text;
  }
}
