import { createHash } from 'crypto';

const server = 'http://localhost:3010';

export async function save(_id, data) {
  const hash = createHash('sha256').update(data).digest('hex');
  const url = `${server}/${hash}`;
  await fetch(url, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    mode: 'cors',
    body: data
  });

  return url;
}