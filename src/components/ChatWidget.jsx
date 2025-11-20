import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Sparkles, MapPin } from "lucide-react";
import Message from "./Message";
import LoadingIndicator from "./LoadingIndicator";
// import RichPreviewModal from "./RichPreviewModal";
import openInPopup from "./RichPreviewModal";
import SuggestionChip from "./SuggestionChip";

const SUGGESTIONS = [
  "What is Fab City and how does it work?",
  "How can I get involved in local Fab City initiatives?",
  "What are the Fab City initiatives",
  "What are the key principles of Fab City?",
];

const ChatInterface = () => {
  // API URL for the chat interface
  // const apiUrl= "http://localhost:3001"
  const apiUrl = "https://fab-city-express-1.onrender.com";
  const logoUrl = "/fab-city-logo.png";

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimatingSend, setIsAnimatingSend] = useState(false);
  const [error, setError] = useState(null);
  // const [previewUrl, setPreviewUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [domain, setDomain] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState("prompt");
  const [showLocationBanner, setShowLocationBanner] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // Generate session ID and capture domain when component mounts
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);
    const currentDomain = window.location.hostname;
    setDomain(currentDomain);
    //console.log('🆔 Session ID:', newSessionId);
    //console.log('🌐 Domain:', currentDomain);
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      setLocationPermission("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(userLocation);
        setLocationPermission("granted");
        setShowLocationBanner(false);
        //console.log('📍 Location captured:', userLocation);
      },
      (err) => {
        console.warn("Location access denied:", err.message);
        setLocationPermission("denied");
        setShowLocationBanner(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Auto-dismiss location banner after 4 seconds
  useEffect(() => {
    if (showLocationBanner && locationPermission === "prompt") {
      const timer = setTimeout(() => {
        setShowLocationBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showLocationBanner, locationPermission]);

  const latestMessagesRef = useRef([]);

  // Keep ref updated with current messages
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  // Handle unload once (always reads latest messages)
  useEffect(() => {
    if (!sessionId || !domain) {
      //console.log('no session id');
      return;
    }

    //console.log('fired');

    const sendChatLog = () => {
      const latestMessages = latestMessagesRef.current;
      if (!latestMessages || latestMessages.length === 0) return;

      // ✅ Transform into turn-based format
      const formattedConversation = latestMessages
        .map(
          (msg) => `**${msg.sender === "user" ? "User" : "AI"}**: ${msg.text}`
        )
        .join("\n");

      const payload = {
        sessionId,
        domain,
        totalMessages: latestMessages.length,
        conversation: formattedConversation,
        timestamp: new Date().toISOString(),
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        const ok = navigator.sendBeacon(`${apiUrl}/api/logs`, blob);
        //console.log("📡 Beacon status:", ok, payload);
      } catch (err) {
        console.error("Failed to send unload beacon:", err);
      }
    };

    // when tab closes or reloads
    window.addEventListener("beforeunload", sendChatLog);
    // when tab visibility changes (e.g., reload, navigate away)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendChatLog();
    });

    return () => {
      window.removeEventListener("beforeunload", sendChatLog);
      document.removeEventListener("visibilitychange", sendChatLog);
    };
  }, [sessionId, domain]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 4000);
    }
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  // Paper-plane send animation variants
  const planeVariants = {
    idle: { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 },
    sending: {
      x: 56,
      y: -32,
      rotate: 20,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
    },
  };

  const handleTypingComplete = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyped: true } : msg
      )
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // trigger send animation
    setIsAnimatingSend(true);
    // clear animation after it completes
    setTimeout(() => setIsAnimatingSend(false), 700);

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        message: userMessage.text,
        sessionId: sessionId,
        domain: domain,
      };

      if (location) {
        requestBody.location = location;
        //console.log('📍 Sending location to backend:', location);
      } else {
        //console.log('⚠️ No location available to send');
      }

      //console.log('📤 Full request body:', requestBody);

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      //console.log('📥 Received from backend:', data);

      let responseText = "";
      if (Array.isArray(data) && data.length > 0) {
        responseText =
          data[0].output || data[0].response || data[0].message || "";
      } else if (typeof data === "object") {
        responseText = data.response || data.message || data.output || "";
      } else if (typeof data === "string") {
        responseText = data;
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: responseText || "Sorry, I couldn't process that.",
        sender: "ai",
        timestamp: new Date(),
        isTyped: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to get response. Please try again.");
      const errorMessage = {
        id: Date.now() + 1,
        text: "⚠️ Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // const handleLinkClick = (url) => {
  //   setPreviewUrl(url);
  // };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <div className="h-screen w-full sleek-gradient flex flex-col">
        {/* Header */}
        <div className="relative bg-transparent sticky top-0 z-10">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-400"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Fab City Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    Fab City Assistant
                  </h1>
                  <p className="text-sm text-gray-400">
                    Your guide to urban innovation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Permission Banner */}
        <AnimatePresence>
          {showLocationBanner && locationPermission === "prompt" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 border-b border-blue-100"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-600" size={20} />
                  <p className="text-sm text-blue-900">
                    We use your location to personalize answers with Fab City
                    initiatives and resources near you
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto chat-scrollbar">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh]"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-6 shadow-xl">
                  <img
                    src={logoUrl}
                    alt="Fab City Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3 text-center">
                  Welcome to Fab City
                </h2>
                <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
                  Your intelligent assistant for exploring sustainable urban
                  innovation, circular manufacturing, and the future of cities.
                </p>
                {location && (
                  <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
                    <MapPin size={16} />
                    <span>
                      Location Enabled - Get answers for your area.
                    </span>
                  </div>
                )}
                <div className="w-full max-w-2xl">
                  <p className="text-sm font-medium text-gray-300 mb-4">Suggested questions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SUGGESTIONS.map((suggestion, index) => (
                      <SuggestionChip
                        key={index}
                        text={suggestion}
                        onClick={handleSuggestionClick}
                      />
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
                  <div className="flex justify-center my-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                      <LoadingIndicator logoUrl={logoUrl} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="border-t border-red-100 bg-red-50"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
  <div className="border-t border-gray-700 bg-transparent sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {/* Textarea sits here; send button is a sibling */}
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    // Auto-resize textarea: reset height then set to scrollHeight
                    e.target.style.height = 'auto';
                    const newHeight = Math.min(e.target.scrollHeight, 600);
                    e.target.style.height = newHeight + 'px';
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Fab City..."
                  className="chat-input-textarea w-full px-4 py-3 border border-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent resize-none bg-[#151515] text-white placeholder-gray-500 shadow-sm"
                  rows="1"
                  style={{
                    minHeight: "48px",
                    height: "48px",
                  }}
                />
              </div>

              {/* Send button placed next to the input */}
              <AnimatePresence>
                {(inputValue.trim() || isLoading) && (
                  <motion.button
                    key="send-button-outside"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors select-none z-10 ${
                      !inputValue.trim() || isLoading
                        ? 'bg-gray-700 text-gray-300 cursor-not-allowed opacity-60 border border-gray-700'
                        : 'bg-[#0f1720] hover:bg-[#111827] text-white border border-gray-700'
                    }`}
                    aria-label="Send message"
                  >
                    <motion.div
                      variants={planeVariants}
                      animate={isAnimatingSend ? 'sending' : 'idle'}
                      initial="idle"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Send size={16} />
                    </motion.div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Powered by Fab City AI & <span>ManyMangoes</span> • Press Enter to
              send
            </p>
          </div>
        </div>

        {/* Rich Preview Modal */}
        {/* {previewUrl && (
          <RichPreviewModal
            url={previewUrl}
            onClose={() => setPreviewUrl(null)}
          />
        )} */}
      </div>
    </>
  );
};

export default ChatInterface;