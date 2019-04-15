pragma solidity ^0.5.0;

/**
 * @title DelegateProxy
 * @dev Implements delegation of calls to other contracts, with proper
 * forwarding of return values and bubbling of failures.
 *
 * Adapted from https://github.com/zeppelinos/zos/blob/ef03e13516855757b9bcfda6f0a8aab5534240db/packages/lib/contracts/upgradeability/Proxy.sol
 */
contract DelegateProxy {
  // Stores address in the first slot
  // Target contract must define address as the first variable as well
  address private implementation;

  constructor(address _implementation, bytes memory _data) public payable {
    implementation = _implementation;
    if (_data.length > 0) {
      (bool success,) = _implementation.delegatecall(_data);
      require(success);
    }
  }

  // Fallback function delegates all calls to implementation
  function () payable external {
    address impl = implementation;

    assembly {
      // Copy msg.data. We take full control of memory in this inline assembly
      // block because it will not return to Solidity code. We overwrite the
      // Solidity scratch pad at memory position 0.
      calldatacopy(0, 0, calldatasize)

      // Call the implementation.
      // out and outsize are 0 because we don't know the size yet.
      let result := delegatecall(gas, impl, 0, calldatasize, 0, 0)

      // Copy the returned data.
      returndatacopy(0, 0, returndatasize)

      switch result
      // delegatecall returns 0 on error.
      case 0 { revert(0, returndatasize) }
      default { return(0, returndatasize) }
    }
  }
}
