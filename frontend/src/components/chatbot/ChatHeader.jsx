import React from 'react';

const ChatHeader = ({ isTyping, badge, scoreActual }) => {
  return (
    <div className="versa-header">
      <div className="versa-header-left">
        <div className="versa-avatar"><span>V</span></div>
        <div>
          <div className="versa-name">Versa <span className="versa-tag">PrediVersa</span></div>
          <div className="versa-status">
            <span className="v-dot" />
            {isTyping ? 'Escribiendo...' : 'En línea · Confidencial'}
          </div>
        </div>
      </div>
      {badge && (
        <div className={`versa-badge ${badge.cls}`}>
          {badge.ico} {badge.label}
          {scoreActual !== null && <span className="v-score">{scoreActual}/100</span>}
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
