import React from 'react';

export default function Address ({ address }) {
  return (
    <span style={{ fontFamily: "'Courier New', Courier, monospace"}}>
      {address.slice(0, 8)}
    </span>
  );
}