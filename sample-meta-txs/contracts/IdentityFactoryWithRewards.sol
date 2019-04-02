pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "./Identity.sol";

contract IdentityWithReward is Identity {
  constructor(address owner, uint256 reward, address payable deployer) Identity(owner) public {
    deployer.transfer(reward);
  }
}

contract IdentityFactoryWithRewards {
  using ECDSA for bytes32;

  event IdentityCreated(address identity);

  bytes32 private contractCodeHash;

  constructor() public {
    contractCodeHash = keccak256(
      type(IdentityWithReward).creationCode
    );
  }

  function getHash(uint256 reward, uint256 salt, address owner) public view returns (bytes32) {
    return keccak256(abi.encodePacked(reward, salt, owner, address(this)));
  }

  function deploy(uint256 reward, uint256 salt, address owner, bytes memory _signature) public returns (address) {
    bytes32 hash = getHash(reward, salt, owner).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    
    return _deployProxy(_salt, _logic, _admin, _data, signer);
  }

  function getDeploymentAddress(uint256 _salt, address _sender) public view returns (address) {
    // Adapted from https://github.com/archanova/solidity/blob/08f8f6bedc6e71c24758d20219b7d0749d75919d/contracts/contractCreator/ContractCreator.sol
    bytes32 salt = _getSalt(_salt, _sender);
    bytes32 rawAddress = keccak256(
      abi.encodePacked(
        bytes1(0xff),
        address(this),
        salt,
        contractCodeHash
      )
    );

    return address(bytes20(rawAddress << 96));
  }

  function getSigner(uint256 _salt, address _logic, address _admin, bytes memory _data, bytes memory _signature) public pure returns (address) {
    bytes32 msgHash = ZOSLibECDSA.toEthSignedMessageHash(
      keccak256(
        abi.encodePacked(
          _salt, _logic, _admin, _data
        )
      )
    );

    return ZOSLibECDSA.recover(msgHash, _signature);
  }

  function _deployProxy(uint256 _salt, address _logic, address _admin, bytes memory _data, address _sender) internal returns (address) {
    InitializableAdminUpgradeabilityProxy proxy = _createProxy(_salt, _sender);
    emit ProxyCreated(address(proxy));
    proxy.initialize(_logic, _admin, _data);
    return address(proxy);
  }

  function _createProxy(uint256 _salt, address _sender) internal returns (InitializableAdminUpgradeabilityProxy) {
    address payable addr;
    bytes memory code = type(InitializableAdminUpgradeabilityProxy).creationCode;
    bytes32 salt = _getSalt(_salt, _sender);

    assembly {
      addr := create2(0, add(code, 0x20), mload(code), salt)
      if iszero(extcodesize(addr)) {
        revert(0, 0)
      }
    }

    return InitializableAdminUpgradeabilityProxy(addr);
  }

  function _getSalt(uint256 _salt, address _sender) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(_salt, _sender)); 
  }
}