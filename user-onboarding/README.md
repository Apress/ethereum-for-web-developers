# User onboarding

Snippets and contracts for the user onboarding chapter. Run `npm install` at the root of this folder, and then `cd` into each section and use `node` to run the scripts within.

## Forwarding contracts

Code for the `Donations` contract that has two main entry points, `donateA` and `donateB`. Instead of having users explicitly call into them by including the corresponding `data` to their transactions, two forwarding contracts `DonateA` and `DonateB` are deployed, which will call into the corresponding function of the main contract when they receive ETH.

## Single use addresses 

Script for creating single-use addresses. Start a local ganache instance in port 8545 and run `node index.js` to execute. The script will create a sample `Donations` contract, with a main entry point `donate(string)`, and generate a single-use address to call into it with the string `Hello world`.
```
$ node index.js 
Deployed donations sample contract at 0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab
Created single use address 0x3db8b0e78f81fc25bd94a8bebcbaf1b0689a6809 to send transaction to donations contract for calling donate("Hello world")
Sent transaction 0x78a86bf79a0e2ed5e1f91ac7d7001333442b45db87f0b470c3ae079911884dac from single-use address
Got event from donation contract with text: Hello world
```

## Mnemonics

Script for generating a mnemonic and deriving a private key from it. Run it as `node index.js`.
```
$ node index.js 
Mnemonic: swallow renew laugh welcome staff mother soul size caught final mobile nominee
Private key: 0xa239803e6e7e9aa26cd3e2d0cb742e3e4c511ca265d2e0a72f7297dc68f8d885
```

## Identity contracts

Contract code for an identity contract, and sample script for deploying and interacting with it. Start a local ganache instance in port 8545 and run `node index.js` to execute. The script will call into a sample `Greeter` contract via the identity contract, changing its `greeting` propery.
```
$ node index.js 
Created identity contract at 0xCfEB869F69431e42cdB54A4F4f105C19C080A601 owned by 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Account 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 added to the identity

Sent 1 ETH to 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
Identity funds are now 9000000000000000000 and third party are 101000000000000000000

Deployed greeter contract at 0x17e91224c30c5b0B13ba2ef1E84FE880Cb902352
Changed greeting to Hey
```

## Identity contract deployment with single use address

Script for deploying an identity contract using a single-use address. Relies on the contract code from identity contracts. Start a local ganache instance in port 8545 and run `node index.js` to execute.
```
$ node index.js 
Single-use address is 0x944a82b24871219e14e8a7667a5d1df743d6a160
Identity contract will be deployed at 0x686ab6da538c6ec1701a13fa51734af167b3fd08
Funded single-use address with 1.0006057 ETH
Checking if owner is registered in identity: true
```

## Upgrading identity contracts

Contract code for upgradeable identities and delegating proxies, and script for deploying and upgrading both the logic contract and a proxy. Start a local ganache instance in port 8545 and run `node index.js` to execute. The script will deploy an `UpgradeableIdentity` as the first logic contract, create a proxy backed by it, and then upgrade it to a new logic contract `UpgradeableIdentityV2` which adds a new `echo` function.
```
$ node index.js 
Created identity logic contract at 0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb
Created proxy to identity at 0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7
Identity contract is now managed by 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 and 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
Created identity logic contract V2 at 0xe982E462b094850F12AF94d21D470e21bE9D0E9C
Echoed foo from new identity contract
```

## Signing messages

Script for signing arbitrary messages with an ethereum private key, and recovering the signer address both on and off chain. Start a local ganache instance in port 8545 and run `node index.js` to execute. The script will sign the message `Hello world`, recover the signer address using the `web3` library, and then deploy a sample contract with a `recover` function that performs the same task but on-chain.
```
$ node index.js 
Signed message 'Hello world' with account 0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e
Recovered address 0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E as signer
Recovered address 0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E via smart contract
```

## Meta transactions

Set of sample scripts for meta transactions with corresponding contracts. Start a local ganache instance in port 8545 and run `node` followed by the name of the script to execute.
- **`identity-with-meta-txs`**: Deploys an `IdentityWithMetaTxs` contract, and relays a meta transaction to it, that forwards a call to change the `greeting` of a sample `Greeter` third-party contract.
```
$ node 01-identity-with-meta-txs.js 
Created identity contract at 0x0290FB167208Af455bB137780163b7B7a9a10C16 owned by 0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e
Deployed greeter contract at 0x9b1f7F645351AF3631a656421eD2e40f2802E6c0
Changed greeting to Hey
```
- **`identity-with-rewards`**: Similar to the previous one, but deploys an `IdentityWithRewards` contract that awards a specified reward to the relayer that submits the meta tx; the script includes code for estimating the relayer's profit.
```
$ node 02-identity-with-rewards.js 
Created identity contract at 0x2612Af3A521c2df9EAF28422Ca335b04AdF3ac66 owned by 0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e
Deployed greeter contract at 0xA57B8a5584442B467b4689F1144D269d096A3daF
Signature for request is 0x103338d8373f093656560c139b2d85fb33383c267e546f5b738d36135e767945590f50d0068fa232f09b6f92d27a1a50aca56589237f6ce50fd7f6f19c7618fa1c
Relayer estimates a profit of 0.000010116 ETH from the execution (worst case -0.00016000)
Actual profit was 0.000010116
Changed greeting to Hey
```
- **`identity-with-token-rewards`**: Similar to the previous one, but deploys an `IdentityWithTokenRewards` contract that awards a specified reward in an ERC20 token instead of ETH.
```
$ node 03-identity-with-token-rewards.js 
Created identity contract at 0x630589690929E9cdEFDeF0734717a9eF3Ec7Fcfe owned by 0xaca94ef8bd5ffee41947b4585a84bda5a3d3da6e
Deployed token contract at 0x0E696947A06550DEf604e82C26fd9E493e576337
Deployed greeter contract at 0xDb56f2e9369E0D7bD191099125a3f6C370F8ed15
Signature for request is 0xed99c55249489a85986921f6f0ca9ccc0fbcac80eacd0c51d27b71142d7102b275391d8c42af640df483ef98ac60e29ca615bec9044b6c2168c9c6768d807c911c
Gas cost was 0.00011387
Reward in tokens was 0.010000
Changed greeting to Hey
```
- **`deploy-with-create2`**: Creates an `IdentityFactoryWithRewards` contract, which uses `create2` to deploy `IdentityWithReward` contract in a reserved address, that rewards the deployer in its constructor.
```
$ node 04-deploy-with-create2.js 
Created identity factory contract at 0x6eD79Aa1c71FD7BdBC515EfdA3Bd4e26394435cC
Predicted deployment address is 0x8b0c67d1444B7bA1c84885e62d6e6E26235Af470
Deployment succeeded at 0x8b0c67d1444B7bA1c84885e62d6e6E26235Af470
Relayer profit was 0.099510111 ETH
Checking if owner is registered in identity: true
```

## ENS

Sample scripts on the Ethereum Name System. Unlike the previous ones, these scripts require connections to specific networks: mainnet and rinkeby. Spin up a geth or parity node connected to such networks (listening in port 8545), and use `node` followed by the name of the script to execute.
- **`resolve`**: Resolves an ENS name from _mainnet_, and uses reverse resolution on the result.
```
$ node 01-resolve.js
Domain ethereumfoundation.eth resolved to 0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359
Address 0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359 resolved to ethereumfoundation.eth
```
- **`register`**: Registers the domain `my-app-NNNN.test` in the _rinkeby_ test registrar, sets up a FIFS registrar for its subdomains, and deploys an `IdentityWithENS` identity contract that registers itself with an ENS name under that domain.
```
$ node 02-register.js
Domain my-app-4871.test registered to 0xd97709745693EAC4bb09B20EE1cF8A78DCA53Be5
Set registrar as owner of domain my-app-4871.test
Deployed identity 0x68beC0c5C6057A9de6f32329De7f4018A11588aA
Registering identity
Registered identity 0x68beC0c5C6057A9de6f32329De7f4018A11588aA as user-2.my-app-4871.test
Identity user-2.my-app-4871.test resolved to 0x68beC0c5C6057A9de6f32329De7f4018A11588aA
```
