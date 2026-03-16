import ChatbotVersa from './ChatbotVersa';
import './StudentChatbot.css';

const StudentChatbot = ({ user }) => {
  return (
    <div className="student-chatbot-container">
      <ChatbotVersa user={user} />
    </div>
  );
};

export default StudentChatbot;
