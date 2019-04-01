import React from 'react';

export default function({ token }) {
  const { id, existing, confirmations } = token;
  const pending = typeof(confirmations) === "undefined";
  const confirmed = confirmations >= 6;

  console.log("Confirmations", confirmations, "pending", pending)
  
  let status;
  if (existing) {
    status = "";
  } else if (pending) {
    status = "Pending";
  } else if (confirmed) {
    status = "Confirmed";
  } else {
    status = "Unconfirmed";
  }

  return (
    <div>
      <div className="ERC721-token-id">{ id.toString() }</div>
      <span className="ERC721-token-status">{status}</span>
    </div>
  );
}