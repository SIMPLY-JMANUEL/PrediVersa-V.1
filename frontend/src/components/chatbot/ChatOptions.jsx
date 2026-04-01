import React from 'react';

const ChatOptions = ({ opciones, onOptionClick, isTyping }) => {
  if (opciones.length === 0) return null;

  return (
    <div className="versa-options">
      {opciones.map((op, i) => (
        <button 
          key={i} 
          id={`v-op-${i}`} 
          className="v-btn" 
          onClick={() => onOptionClick(op)} 
          disabled={isTyping}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
};

export default ChatOptions;
