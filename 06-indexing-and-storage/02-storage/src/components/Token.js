import React from 'react';

export default function({ token }) {
  const { id, confirmed, title, description } = token;
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
      <div title={description} className="ERC721-token-id">{ title } ({ id.toString() })</div>
      <span className="ERC721-token-status">{status}</span>
    </div>
  );
}