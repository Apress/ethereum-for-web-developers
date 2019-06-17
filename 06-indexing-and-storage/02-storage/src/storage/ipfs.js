import ipfsClient from 'ipfs-http-client';

let client;
async function getClient() {
  if (!client) {
    if (window.ipfs && window.ipfs.enable) {
      client = await window.ipfs.enable({ commands: ['id','version', 'add', 'get'] });
    } else {
      client = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https', 'api-path': '/api/v0/' });
    }
  } return client;
}

export async function save(_id, data) {
  const ipfs = await getClient();
  const [result] = await ipfs.add(Buffer.from(data));
  return `/ipfs/${result.path}`;
}

export async function load(url) {
  try {
    const ipfs = await getClient();
    const [result] = await ipfs.get(url);
    return JSON.parse(result.content.toString());
  } catch (err) {
    console.error(err);
    return {};
  }
}