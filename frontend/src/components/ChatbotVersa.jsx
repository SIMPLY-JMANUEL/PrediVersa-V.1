import React from 'react';
import './ChatbotVersa.css';
import { useChatbot } from '../hooks/useChatbot';
import ChatHeader from './chatbot/ChatHeader';
import ChatMessages from './chatbot/ChatMessages';
import ChatOptions from './chatbot/ChatOptions';
import ChatInput from './chatbot/ChatInput';

/**
 * ChatbotVersa - Componente principal refactorizado.
 * Utiliza el hook useChatbot para la lógica y sub-componentes para la UI.
 */
export default function ChatbotVersa({ user }) {
  const {
    messages,
    isTyping,
    opciones,
    inputValue,
    setInputValue,
    inputDisabled,
    scoreActual,
    endRef,
    textareaRef,
    handleOpcion,
    handleSend,
    handleKeyDown,
    badge,
  } = useChatbot(user);

  return (
    <div className="versa-wrapper animate-fade-in">
      {/* ── HEADER ── */}
      <ChatHeader 
        isTyping={isTyping} 
        badge={badge} 
        scoreActual={scoreActual} 
      />

      {/* ── MENSAJES ── */}
      <ChatMessages 
        messages={messages} 
        isTyping={isTyping} 
        endRef={endRef} 
      />

      {/* ── OPCIONES ── */}
      <ChatOptions 
        opciones={opciones} 
        onOptionClick={handleOpcion} 
        isTyping={isTyping} 
      />

      {/* ── INPUT ── */}
      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
        inputDisabled={inputDisabled}
        isTyping={isTyping}
        textareaRef={textareaRef}
      />

      {/* ── FOOTER ── */}
      <div className="v-foot">🔒 Todo lo que compartes es confidencial</div>
    </div>
  );
}
