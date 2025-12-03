import ChatInterface from './components/ChatWidget';
import SmartRAGLayout from './components/SmartRAGLayout';

function App() {
  return (
    <SmartRAGLayout
      renderChat={({ handleCitationClick }) => (
        <ChatInterface handleCitationClick={handleCitationClick} />
      )}
    />
  );
}

export default App;

