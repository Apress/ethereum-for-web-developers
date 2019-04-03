pragma solidity ^0.5.4;

import "./Identity.sol";

contract IdentityWithReward is Identity {
  constructor(address owner, uint256 reward) Identity(owner) public {
    tx.origin.transfer(reward);
  }
}

contract IdentityFactoryWithRewards {
  event IdentityCreated(address identity);

  function deploy(address owner, uint256 reward, uint256 salt) public returns (address) {
    bytes memory code = getCode(owner, reward);
    
    address identity;
    assembly {
      identity := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(identity)) {
        revert(0, 0)
      }
    }

    emit IdentityCreated(identity);
    return identity;
  }

  function getDeploymentAddress(address owner, uint256 reward, uint256 salt) public view returns (address) {
    bytes memory code = getCode(owner, reward);
    bytes32 codeHash = keccak256(code);
    
    bytes32 rawAddress = keccak256(
      abi.encodePacked(
        bytes1(0xff),
        address(this),
        salt,
        codeHash
      )
    );

    return address(bytes20(rawAddress << 96));
  }

function getCode(address owner, uint256 reward) internal pure returns (bytes memory) {
  return abi.encodePacked(
    type(IdentityWithReward).creationCode, 
    abi.encode(owner, reward)
  );
}
}