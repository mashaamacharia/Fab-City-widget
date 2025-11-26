import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, X, ArrowUpRight } from "lucide-react";
import Message from "./Message";
import LoadingIndicator from "./LoadingIndicator";
// import RichPreviewModal from "./RichPreviewModal";
import openInPopup from "./RichPreviewModal";




const SUGGESTIONS = [
  { text: "What is Fab City and how does it work?" },
  { text: "How can I get involved in local Fab City initiatives?"},
  { text: "What are the Fab City initiatives" },
  { text: "What are the key principles of Fab City?"},
];

const ChatInterface = ({ isWidget = false }) => {
  const apiUrl = 'https://fab-city-express-1.onrender.com';
  const logoUrl = "/fab-city-logo.svg";

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [domain, setDomain] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState("prompt");
  const [showLocationBanner, setShowLocationBanner] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setDomain(window.location.hostname);
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationPermission("granted");
        setShowLocationBanner(false);
      },
      (err) => {
        setLocationPermission("denied");
        setShowLocationBanner(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (showLocationBanner && locationPermission === "prompt") {
      const timer = setTimeout(() => setShowLocationBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showLocationBanner, locationPermission]);

  const latestMessagesRef = useRef([]);
  useEffect(() => { latestMessagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (!sessionId || !domain) return;
    const sendChatLog = () => {
      const latestMessages = latestMessagesRef.current;
      if (!latestMessages || latestMessages.length === 0) return;
      const formattedConversation = latestMessages.map(msg => `**${msg.sender === "user" ? "User" : "AI"}**: ${msg.text}`).join("\n");
      const payload = { sessionId, domain, totalMessages: latestMessages.length, conversation: formattedConversation, timestamp: new Date().toISOString() };
      try { navigator.sendBeacon(`${apiUrl}/api/logs`, new Blob([JSON.stringify(payload)], { type: "application/json" })); } catch (err) { console.error(err); }
    };
    window.addEventListener("beforeunload", sendChatLog);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") sendChatLog(); });
    return () => { window.removeEventListener("beforeunload", sendChatLog); document.removeEventListener("visibilitychange", sendChatLog); };
  }, [sessionId, domain]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);
  
  useEffect(() => {
    if (error) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setError(null), 4000);
    }
  }, [error]);

  const handleTypingComplete = (messageId) => {
    setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, isTyped: true } : msg));
  };

  const handleSendMessage = async (overrideText) => {
    const rawText = typeof overrideText === 'string' ? overrideText : inputValue;
    const textToSend = (rawText || '').trim();
    if (!textToSend || isLoading) return;

    const userMessage = { id: Date.now(), text: textToSend, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = { message: userMessage.text, sessionId, domain, ...(location && { location }) };
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      let responseText = Array.isArray(data) && data.length > 0 ? (data[0].output || data[0].response || data[0].message) : (data.response || data.message || data.output || "");
      
      const aiMessage = { id: Date.now() + 1, text: responseText || "Sorry, I couldn't process that.", sender: "ai", timestamp: new Date(), isTyped: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setError("Failed to get response. Please try again.");
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: "⚠️ Sorry, I encountered an error.", sender: "ai", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  // --- RENDER ---
  return (
  // MAIN CONTAINER: Cream Background (Off-White)
  <div className="h-screen w-full bg-[#FDFBF7] flex flex-col font-sans text-black chatbox-chamfer">
      
      {/* NAVBAR: Cream background with logo and title on the left */}
      <div className="relative bg-[#FDFBF7] sticky top-0 z-10 border-b border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={logoUrl} alt="Fab City Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <div className="text-sm font-bold text-black">Fab City Assistant</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00AA6C] rounded-full animate-pulse"></span>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-widest">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOCATION BANNER */}
      <AnimatePresence>
        {showLocationBanner && locationPermission === "prompt" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-200"
          >
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="text-[#E6333A]" size={16} />
                <span>Locating local resources...</span>
              </div>
              <button onClick={() => setShowLocationBanner(false)}>
                <X size={14} className="text-gray-400 hover:text-black" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              {/* Logo in Black/Grayscale */}
              <div className="w-20 h-20 mb-6 opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
              
              <h2 className="learning-hub-heading mb-2 text-center tracking-tight">
                Hello, Welcome to Fab City
              </h2>
              <p className="text-gray-500 mb-10 text-center max-w-lg">
                I can help you navigate the Fab City network, find labs, and understand the challenge.
              </p>
              
              {/* Suggestions with "Hits" of Color via borders */}
              <div className="w-full max-w-2xl">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Suggested questions:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUGGESTIONS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => { setInputValue(item.text); setTimeout(() => handleSendMessage(item.text), 50); }}
                    className={`group text-left p-0 bg-transparent border-0 shadow-none hover:underline transition-colors`}
                    aria-label={`Suggestion: ${item.text}`}
                  >
                    <div className="flex justify-start items-center">
                      <span className="text-sm font-medium text-gray-800 group-hover:text-black">{item.text}</span>
                    </div>
                  </button>
                ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((message) => (
                <Message
                    key={message.id}
                    message={{
                      ...message,
                      onTypingComplete: handleTypingComplete,
                    }}
                    onLinkClick={openInPopup}
                  />
              ))}
              {isLoading && (
                <div className="flex justify-center my-8">
                  <LoadingIndicator logoUrl={logoUrl} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#E6333A] text-white p-2 text-center text-sm font-medium">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT AREA: Minimalist with RGB accents */}
      <div className="bg-[#FDFBF7] sticky bottom-0 pb-6 pt-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black/20 transition-all duration-200 shadow-sm flex items-end gap-2 px-4 py-4 rounded-lg">
            
              <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about Fab City."
              className="flex-1 bg-transparent text-black placeholder-gray-500 outline-none resize-none font-normal leading-relaxed"
              rows="1"
              style={{ minHeight: "24px", height: "24px", maxHeight: "120px" }}
            />
            
            <AnimatePresence>
              {(inputValue.trim() || isLoading) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
               
                  aria-label="Send message"
                  className="bg-[#FDFBF7] hover:bg-[#fbf9f5] text-black p-2 rounded-md transition-colors shadow-sm border border-gray-200"
                >
                  <Send size={18} strokeWidth={2} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center mt-3 gap-1">
             <div className="h-1 w-1 bg-[#E6333A] rounded-full"></div>
             <div className="h-1 w-1 bg-[#00AA6C] rounded-full"></div>
             <div className="h-1 w-1 bg-[#1E4796] rounded-full"></div>
             <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-2">Powered by Fab City AI & ManyMangoes</span>
          </div>
        </div>
      </div>

      {previewUrl && <RichPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
};

export default ChatInterface;
