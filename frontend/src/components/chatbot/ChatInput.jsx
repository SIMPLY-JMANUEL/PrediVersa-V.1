import React from 'react';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  handleKeyDown, 
  inputDisabled, 
  isTyping, 
  textareaRef 
}) => {
  return (
    <div className="versa-input-row">
      <textarea
        ref={textareaRef}
        id="versa-input"
        className="v-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={inputDisabled ? 'Elige una opción...' : `Escribe aquí...`}
        disabled={inputDisabled}
        rows={1}
      />
      <button 
        id="v-send" 
        className="v-send" 
        onClick={handleSend} 
        disabled={inputDisabled || !inputValue.trim() || isTyping}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
