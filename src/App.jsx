import ChatWidgetContainer from './components/ChatWidgetContainer';

function App() {
  // Set isWidgetMode to false if you want full-page mode
  // Set to true for widget mode (floating button that opens modal)
  return <ChatWidgetContainer isWidgetMode={true} />;
}

export default App;

