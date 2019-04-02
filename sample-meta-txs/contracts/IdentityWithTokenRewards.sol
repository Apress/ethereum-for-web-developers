pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./Identity.sol";

pragma solidity ^0.5.0;

contract IdentityWithTokenRewards is Identity {
  using ECDSA for bytes32;

  uint256 public nonce;

  event Forwarded(uint256 nonce, bool success, address relayer);

  constructor(address owner) Identity(owner) public payable { }

  // Forward arbitrary calls and funds to a third party
  function forward(uint256 reward, address rewardToken, uint256 gasPrice, uint256 gasLimit, address to, uint256 value, bytes memory data, bytes memory signature) public returns (bytes memory) {
    require(tx.gasprice >= gasPrice, "Gas price is below requested");
    
    bytes32 hash = getHash(reward, rewardToken, gasPrice, gasLimit, to, value, data).toEthSignedMessageHash();
    address signer = hash.recover(signature);
    require(accounts[signer], "Signer is not a registered account");
    
    nonce++;
    require(gasleft() >= gasLimit);
    (bool success, bytes memory returnData) = to.call.value(value).gas(gasLimit)(data);
    emit Forwarded(nonce, success, msg.sender);
    
    if (rewardToken == address(0)) {
      msg.sender.transfer(reward);
    } else {
      require(IERC20(rewardToken).transfer(msg.sender, reward));
    }
    
    return returnData;
  }

  // Calculates the hash to be signed for a meta-transaction
  function getHash(uint256 reward, address rewardToken, uint256 gasPrice, uint256 gasLimit, address to, uint256 value, bytes memory data) public view returns (bytes32) {
    return keccak256(abi.encodePacked(reward, rewardToken, gasPrice, gasLimit, to, value, data, nonce, address(this)));
  }
}