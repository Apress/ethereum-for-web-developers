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

export async function load(url) {
  const data = await fetch(url).then(res => res.json()).catch(() => "");
  const hash = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  const path = new URL(url).pathname.slice(1);
  if (path === hash) return data;
}