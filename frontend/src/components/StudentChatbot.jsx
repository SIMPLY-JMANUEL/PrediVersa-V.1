import React from 'react';
import './StudentChatbot.css';

const StudentChatbot = () => {
  return (
    <div className="student-chatbot-container">
      <iframe
        src="https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/02/04/01/20260204011551-1M9X8Z3Y.json"
        title="Chat Evalúa - Asistente Virtual"
        allow="microphone"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '520px',
          border: 'none',
          display: 'block',
        }}
      />
    </div>
  );
};

export default StudentChatbot;
