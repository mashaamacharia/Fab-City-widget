import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, X, ArrowUpRight, Copy, Check, RefreshCw, Download, Share2, Trash2, MoreVertical, History, Plus } from "lucide-react";
import Message from "./Message";
import LoadingIndicator from "./LoadingIndicator";
import RichPreviewModal from "./RichPreviewModal";
import { prefetchMessageUrls } from "../utils/resourcePrefetch";
// import openInPopup from "./RichPreviewModal";




const SUGGESTIONS = [
  { text: "What is Fab City and how does it work?" },
  { text: "How can I get involved in local Fab City initiatives?"},
  { text: "What are the Fab City initiatives" },
  { text: "What are the key principles of Fab City?"},
];

const ChatInterface = ({ isWidget = false, handleCitationClick }) => {
  // const apiUrl = 'http://localhost:3001';

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
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [pullToRefresh, setPullToRefresh] = useState({ isPulling: false, distance: 0, canRefresh: false });
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pullStartRef = useRef({ y: 0, scrollTop: 0 });
  const [refresh, setRefresh] = useState(false)

  // Load conversations from localStorage
  // Load conversations from localStorage (ONCE)
  useEffect(() => {
    console.log('fired')
    const savedConversations = localStorage.getItem('fabcity_conversations');

    if (savedConversations) {
      try {
        let parsed = JSON.parse(savedConversations) || [];
        console.log(parsed)

        // FIFO: keep only the last 5 (oldest removed)
        if (parsed.length > 5) {
          parsed = parsed.slice(0, 5);  // if your newest is index 0
        }

        setConversations(parsed);

        // Also rewrite fixed list back to localStorage
        localStorage.setItem('fabcity_conversations', JSON.stringify(parsed));

      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
  }, [refresh]); // <-- MUST be empty


  // Load current session messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('fabcity_current_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    }
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setDomain(window.location.hostname);
    requestLocation();
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('fabcity_current_messages', JSON.stringify(messages));
      localStorage.setItem('fabcity_current_session', sessionId);
    }
  }, [messages, sessionId]);

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

  // Auto-resize textarea on mount and when input value changes
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = Math.min(200, window.innerHeight * 0.3);
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      if (scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [inputValue]);

  // Handle window resize for responsive max height
  useEffect(() => {
    const handleResize = () => {
      if (inputRef.current) {
        const textarea = inputRef.current;
        const maxHeight = Math.min(200, window.innerHeight * 0.3);
        textarea.style.maxHeight = `${maxHeight}px`;
        if (textarea.scrollHeight > maxHeight) {
          textarea.style.overflowY = 'auto';
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (error) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setError(null), 4000);
    }
  }, [error]);

  const handleTypingComplete = (messageId) => {
    setMessages((prev) => prev.map((msg) => msg.id === messageId ? { ...msg, isTyped: true } : msg));
  };

  const handleSendMessage = async (overrideText, isRegenerate = false) => {
    const rawText = typeof overrideText === 'string' ? overrideText : inputValue;
    const textToSend = (rawText || '').trim();
    if (!textToSend || isLoading) return;

    const timestamp = new Date();
    let userMessage = null;

    if (isRegenerate) {
      // Regenerate: do NOT add a duplicate user bubble, just remove the last AI response.
      setMessages((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].sender === 'ai') {
            updated.splice(i, 1);
            break;
          }
        }
        return updated;
      });
      // Leave the existing user message as-is in the UI.
    } else {
      userMessage = { id: Date.now(), text: textToSend, sender: "user", timestamp };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
    }

    setIsLoading(true);
    setError(null);
    setLastFailedMessage(null);

    try {
      const requestBody = { message: textToSend, sessionId, domain, ...(location && { location }) };
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
      
      // Prefetch all URLs in the AI response for faster loading when user clicks citations
      if (responseText) {
        // Use setTimeout to avoid blocking the UI update
        setTimeout(() => {
          prefetchMessageUrls(responseText);
        }, 100);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to get response. Please try again.");
      const failedUserMessage = userMessage || { id: Date.now(), text: textToSend, sender: "user", timestamp: new Date() };
      setLastFailedMessage({ message: failedUserMessage, error: err });
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: "⚠️ Sorry, I encountered an error.", sender: "ai", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage.message.text, false);
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.text, true);
    }
  };

  const handleCopyMessage = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessages((prev) => prev.filter(msg => msg.id !== messageId));
  };

  const handleNewConversation = () => {
    if (messages.length > 0) {
      // Save current conversation to history
      const conversation = {
        id: sessionId,
        title: messages[0]?.text?.substring(0, 50) || 'New Conversation',
        messages: messages,
        timestamp: new Date().toISOString()
      };
      const updatedConversations = [conversation, ...conversations].slice(0, 50); // Keep last 50
      setConversations(updatedConversations);


      localStorage.setItem('fabcity_conversations', JSON.stringify(updatedConversations));
    }
    
    // Clear current conversation
    setMessages([]);
    setInputValue("");
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.removeItem('fabcity_current_messages');
    localStorage.setItem('fabcity_current_session', newSessionId);
    setRefresh(prev=>!prev)
  };

  const handleLoadConversation = (conversation) => {
    setMessages(conversation.messages);
    setSessionId(conversation.id);
    setShowHistory(false);
    localStorage.setItem('fabcity_current_messages', JSON.stringify(conversation.messages));
    localStorage.setItem('fabcity_current_session', conversation.id);
  };

  const handleExportConversation = () => {
    const conversationText = messages.map(msg => {
      const sender = msg.sender === 'user' ? 'You' : 'Fab City Assistant';
      const time = new Date(msg.timestamp).toLocaleString();
      return `[${time}] ${sender}: ${msg.text}`;
    }).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fab-city-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareConversation = async () => {
    const conversationData = {
      messages: messages,
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    };
    
    const shareText = `Fab City Conversation\n\n${messages.map(msg => {
      return `${msg.sender === 'user' ? 'You' : 'Assistant'}: ${msg.text}`;
    }).join('\n\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Fab City Conversation',
          text: shareText
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyMessage(shareText, 'share');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K: Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Ctrl/Cmd + Enter: Send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
          handleSendMessage();
        }
      }
      // Escape: Close history sidebar
      if (e.key === 'Escape' && showHistory) {
        setShowHistory(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, isLoading, showHistory]);
  const handleLinkClick = (url, citationText = '') => {
    // If handleCitationClick is provided (from SmartRAGLayout), use it
    // Otherwise, fall back to the modal preview
    if (handleCitationClick) {
      handleCitationClick(url, citationText);
    } else {
      setPreviewUrl(url);
    }
  };


  const handleKeyPress = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  // --- RENDER ---
  return (
  // MAIN CONTAINER: Cream Background (Off-White)
  <div className="h-full w-full bg-[#FDFBF7] flex flex-col font-sans text-black chatbox-chamfer">
      
      {/* NAVBAR: Cream background with logo and title on the left */}
      <div className="relative bg-[#FDFBF7] sticky top-0 z-10 border-b border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  setShowHistory(!showHistory)
                  handleNewConversation()
                }}
                className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                title="Conversation History"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <History size={isMobile ? 20 : 18} className="text-gray-700" />
              </button>
              <button
                onClick={handleNewConversation}
                className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                title="New Conversation"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Plus size={isMobile ? 20 : 18} className="text-gray-700" />
              </button>
              {messages.length > 0 && (
                <>
                  <button
                    onClick={handleExportConversation}
                    className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation hidden sm:flex"
                    title="Export Conversation"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Download size={isMobile ? 20 : 18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={handleShareConversation}
                    className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                    title="Share Conversation"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Share2 size={isMobile ? 20 : 18} className="text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 sm:w-80 bg-white border-r border-gray-200 z-50 shadow-xl overflow-y-auto"
              style={{ width: isMobile ? '85vw' : '320px', maxWidth: '85vw' }}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Conversation History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No previous conversations
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleLoadConversation(conv)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors mb-2"
                    >
                      <div className="font-medium text-sm text-gray-800 truncate">{conv.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(conv.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {conv.messages.length} messages
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

      {/* MESSAGES AREA with Pull to Refresh */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto chat-scrollbar relative pull-refresh-container"
        onTouchStart={(e) => {
          if (!messagesContainerRef.current) return;
          const container = messagesContainerRef.current;
          const touch = e.touches[0];
          pullStartRef.current = {
            y: touch.clientY,
            scrollTop: container.scrollTop
          };
        }}
        onTouchMove={(e) => {
          if (!messagesContainerRef.current || messages.length === 0) return;
          const container = messagesContainerRef.current;
          const touch = e.touches[0];
          const deltaY = touch.clientY - pullStartRef.current.y;
          
          // Only trigger if at top of scroll and pulling down
          if (container.scrollTop === 0 && deltaY > 0) {
            e.preventDefault();
            const distance = Math.min(deltaY * 0.5, 100);
            setPullToRefresh({
              isPulling: true,
              distance: distance,
              canRefresh: distance > 60
            });
          }
        }}
        onTouchEnd={() => {
          if (pullToRefresh.canRefresh && pullToRefresh.isPulling) {
            // Haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate([50, 30, 50]);
            }
            // Refresh: Scroll to top and show a refresh indicator
            messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            // Could trigger a refresh action here if needed
          }
          setPullToRefresh({ isPulling: false, distance: 0, canRefresh: false });
        }}
      >
        {/* Pull to Refresh Indicator */}
        <AnimatePresence>
          {pullToRefresh.isPulling && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: pullToRefresh.distance - 50 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-0 left-0 right-0 flex items-center justify-center z-10"
            >
              <div className={`flex flex-col items-center gap-2 px-4 py-2 rounded-full ${
                pullToRefresh.canRefresh ? 'bg-fabcity-green text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <RefreshCw 
                  size={20} 
                  className={pullToRefresh.canRefresh ? 'animate-spin' : ''}
                />
                <span className="text-xs font-medium">
                  {pullToRefresh.canRefresh ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              {messages.map((message, index) => (
                <Message
                    key={message.id}
                    message={{
                      ...message,
                      onTypingComplete: handleTypingComplete,
                    }}
                    onLinkClick={handleLinkClick}
                    handleCitationClick={handleCitationClick}
                    onCopy={() => handleCopyMessage(message.text, message.id)}
                    onDelete={() => handleDeleteMessage(message.id)}
                    isCopied={copiedMessageId === message.id}
                    isLast={index === messages.length - 1}
                    onRegenerate={message.sender === 'ai' && index === messages.length - 1 ? handleRegenerate : undefined}
                  />
              ))}
              {isLoading && (
                <div className="flex justify-center my-8">
                  <LoadingIndicator logoUrl={logoUrl} />
                </div>
              )}
              
              {/* Suggested Follow-up Questions */}
              {!isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === 'ai' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4"
                >
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggested follow-ups:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Tell me more about this",
                      "What are the next steps?",
                      "Can you provide examples?",
                      "How does this relate to Fab City?"
                    ].slice(0, 3).map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => {
                          setInputValue(suggestion);
                          setTimeout(() => handleSendMessage(suggestion), 50);
                        }}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:border-fabcity-blue hover:bg-gray-50 transition-colors text-gray-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Enhanced ERROR MESSAGE with Retry */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 text-center text-sm font-medium shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <span>{error}</span>
              {lastFailedMessage && (
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT AREA: Gemini-style Textbox */}
      <div className="bg-[#FDFBF7] sticky bottom-0 pb-6 pt-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white border border-gray-300 focus-within:border-gray-400 focus-within:shadow-lg transition-all duration-200 rounded-2xl flex items-end gap-3 px-5 py-3 shadow-sm hover:shadow-md">
            {/* Textarea Container - Gemini Style */}
            <div className="flex-1 relative overflow-hidden">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Smooth auto-resize like Gemini - handles both small and large prompts
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  const scrollHeight = textarea.scrollHeight;
                  // Dynamic max height based on viewport (responsive)
                  const maxHeight = Math.min(200, window.innerHeight * 0.3); // Max 200px or 30% of viewport
                  const newHeight = Math.min(scrollHeight, maxHeight);
                  textarea.style.height = `${newHeight}px`;
                  // Enable hidden scrolling when content exceeds max height
                  if (scrollHeight > maxHeight) {
                    textarea.style.overflowY = 'auto';
                  } else {
                    textarea.style.overflowY = 'hidden';
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Fab City..."
                className="w-full bg-transparent text-black placeholder-gray-400 outline-none resize-none font-normal leading-6 text-base pr-2 chat-input-textarea"
                rows="1"
                style={{ 
                  minHeight: "24px",
                  maxHeight: "200px",
                }}
              />
            </div>
            
            {/* Send Button - Only appears when user starts typing, cream theme */}
            <AnimatePresence>
              {inputValue.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  aria-label="Send message"
                  className="bg-[#FDFBF7] hover:bg-[#fbf9f5] active:bg-[#f5f3ef] text-black border border-gray-200 hover:border-gray-300 p-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
                  style={{ 
                    minWidth: isMobile ? '48px' : '40px',
                    minHeight: isMobile ? '48px' : '40px'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={isMobile ? 20 : 18} strokeWidth={2} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col items-center mt-3 gap-2">
            <div className="flex items-center gap-1">
              <div className="h-1 w-1 bg-[#E6333A] rounded-full"></div>
              <div className="h-1 w-1 bg-[#00AA6C] rounded-full"></div>
              <div className="h-1 w-1 bg-[#1E4796] rounded-full"></div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-2">Powered by Fab City AI & ManyMangoes</span>
            </div>
            <div className="text-[10px] text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">K</kbd> to focus • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Enter</kbd> to send
            </div>
          </div>
        </div>
      </div>

        {previewUrl && <RichPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
      </div>
    // </LoadingProvider>
  );
};

export default ChatInterface;
