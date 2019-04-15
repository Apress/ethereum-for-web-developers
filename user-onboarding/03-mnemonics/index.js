const hdkey = require("ethereumjs-wallet/hdkey");
const bip39 = require("bip39");

const mnemonic = bip39.generateMnemonic();
console.log("Mnemonic:", mnemonic);

const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
const pk = wallet.getPrivateKeyString();
console.log("Private key:", pk);
