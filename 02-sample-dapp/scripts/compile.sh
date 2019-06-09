#!/usr/bin/env bash
solc --pretty-json --combined-json=abi,bin --overwrite -o ./build/contracts contracts/Counter.sol && cp build/contracts/combined.json src/contracts/Artifacts.json