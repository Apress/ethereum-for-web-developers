# Setting up the environment

Sample code for the _Setting up the environment_ section of chapter 5. Run `npx sol-compile` (without `npx` if installed globally) to have the contract `contracts/Greeter.sol` recompiled and generate a new `artifacts/Greeter.json` artifact.

You can start a new development network via `npx ganache-cli -d` (without `npx` if installed globalley) in a separate terminal, and run `node scripts/deploy.js` to have the contract deployed to the development network.