import React from 'react';

export default function({ token }) {
  const { id, confirmed } = token;
  const pending = typeof(confirmed) === "undefined";
  
  let status;
  if (pending) {
    status = "Pending";
  } else if (!confirmed) {
    status = "Awaiting confirmation";
  } else {
    status = "Confirmed";
  }

  return (
    <div>
      <div className="ERC721-token-id">{ id.toString() }</div>
      <span className="ERC721-token-status">{status}</span>
    </div>
  );
}