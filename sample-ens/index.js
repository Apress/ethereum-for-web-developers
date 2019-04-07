const Web3 = require('web3');
const fs = require('fs');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Calculates ENS namehash for a domain
function namehash(name) {
  let node = '0x0000000000000000000000000000000000000000000000000000000000000000';
  if (name !== '') {
    let labels = name.split(".");
    for(let i = labels.length - 1; i >= 0; i--) {
      node = Web3.utils.sha3(node + Web3.utils.sha3(labels[i].toLowerCase()).slice(2), {encoding: 'hex'});
    }
  }
  return node.toString();
}

// Calculates hash for ENS label
function hash(name) {
  return Web3.utils.sha3(name);
}

// Retrieves a contract compiled with sol-compiler
function Contract(web3, artifactName, address) {
  const artifactPath = `./artifacts/${artifactName}.json`;
  const artifact = require(artifactPath);
  const data = artifact.compilerOutput.evm.bytecode.object;
  const abi = artifact.compilerOutput.abi;
  return new web3.eth.Contract(abi, address || null, { data, gas: 1e6 });
}

async function main() {
  const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8575');
  const [account] = await web3.eth.getAccounts();
  const owner = account;
  const user = account;
  
  // Load deployment addresses based on our network
  let ensAddress, publicResolverAddress;
  const networkId = await web3.eth.net.getId();
  if (networkId == 4) { // Rinkeby
    ensAddress = '0xe7410170f87102df0055eb195163a03b7f2bff4a';
    publicResolverAddress = '0xb14fdee4391732ea9d2267054ead2084684c0ad8';  
  } else if (networkId == 3) { // Ropsten
    ensAddress = '0x112234455c3a32fd11230c42e7bccd4a84e02010';
    publicResolverAddress = '0x4c641fb9bad9b60ef180c31f56051ce826d21a9a';  
  } else {
    throw new Error("Network not supported", networkId);
  }
  
  // Load registrar and ens contracts
  const ens = Contract(web3, "ENS", ensAddress);
  const testRegistrarAddress = await ens.methods.owner(namehash('test')).call();
  const testRegistrar = Contract(web3, "FIFSRegistrar", testRegistrarAddress);

  // Domain name to use
  const name = 'palla-v7';
  const domain = `${name}.test`;

  // Load custom registrar info if already deployed
  let myRegistrarAddress = null;
  if (fs.existsSync('registrar.txt')) {
    myRegistrarAddress = fs.readFileSync('registrar.txt').toString();
  }

  // Register domain on test registrar with public resolver
  const domainOwner = await ens.methods.owner(namehash(domain)).call();
  if (domainOwner === ZERO_ADDRESS) {
    await testRegistrar.methods.register(hash(name), owner).send({ from: owner });
    await ens.methods.setResolver(namehash(domain), publicResolverAddress).send({ from: owner });
    console.log(`Domain ${domain} registered to ${owner}`);
  } else if (domainOwner === owner || domainOwner === myRegistrarAddress) {
    console.log(`Domain ${domain} already registered to ${domainOwner}`);
  } else {
    throw new Error(`Domain ${domain} is already registered to ${domainOwner}`);
  }

  // Deploy registrar for subdomain (if not deployed yet)
  let myRegistrar;
  if (!myRegistrarAddress) {
    myRegistrar = await Contract(web3, 'FIFSRegistrar').deploy({ arguments: [ensAddress, namehash(domain)] }).send({ from: owner });
    myRegistrarAddress = myRegistrar.options.address;
    fs.writeFileSync('registrar.txt', myRegistrarAddress);
    console.log(`Deployed my registrar at ${myRegistrarAddress}`);
  } else {
    myRegistrar = Contract(web3, 'FIFSRegistrar', myRegistrarAddress);
  }

  // Appoint as owner of the domain (if not appointed yet)
  if (domainOwner !== myRegistrarAddress) {
    await ens.methods.setOwner(namehash(domain), myRegistrarAddress).send({ from: owner });
    console.log(`Set registrar as owner of domain ${domain}`);
  }
  
  // Create a new identity
  const identity = await Contract(web3, "IdentityWithENS").deploy({ arguments: [user] }).send({ from: user });
  console.log(`Deployed identity ${identity.options.address}`);

  // Register it on ENS
  const userName = `user-2`;
  const userDomain = `${userName}.${domain}`;
  
  console.log(`Registering identity`)
  await identity.methods.registerENS(
    hash(userName), namehash(userDomain), 
    ensAddress, myRegistrar.options.address, publicResolverAddress
  ).send({ from: user });
  console.log(`Registered identity ${identity.options.address} as ${userDomain}`);

  // Resolve it!
  const queriedResolverAddress = await ens.methods.resolver(namehash(userDomain)).call();
  const queriedResolver = Contract(web3, "PublicResolver", queriedResolverAddress);
  const resolvedAddress = await queriedResolver.methods.addr(namehash(userDomain)).call();
  console.log(`Identity ${userDomain} resolved to ${resolvedAddress}`);
}

main()