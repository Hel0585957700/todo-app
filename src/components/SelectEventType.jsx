import React from "react";

export default function SelectEventType({ username, eventTypes, onSelect }) {
  return (
    <div className="card">
      <h2>שלום {username}! בחר סוג אירוע:</h2>
      {Object.keys(eventTypes).map((type) => (
        <button key={type} onClick={() => onSelect(type)} style={{ margin: 8 }}>
          {type}
        </button>
      ))}
    </div>
  );
}
