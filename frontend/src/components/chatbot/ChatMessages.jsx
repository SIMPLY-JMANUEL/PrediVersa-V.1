import React from 'react';

const ChatMessages = ({ messages, isTyping, endRef }) => {
  return (
    <div className="versa-messages">
      {messages.map((msg) => (
        <div key={msg.id} className={`v-row ${msg.type}`}>
          {msg.type === 'bot' && <div className="v-av"><span>V</span></div>}
          <div className={`v-bubble ${msg.type}`}>
            <div className="v-text" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
            <span className="v-time">{msg.time}</span>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="v-row bot">
          <div className="v-av"><span>V</span></div>
          <div className="v-bubble bot v-typing"><span /><span /><span /></div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;
