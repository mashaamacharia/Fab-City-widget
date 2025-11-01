import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, MapPin } from 'lucide-react';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';
import RichPreviewModal from './RichPreviewModal';
import SuggestionChip from './SuggestionChip';

const SUGGESTIONS = [
  "What is Fab City and how does it work?",
  "How can I get involved in local Fab City initiatives?",
  "What are the Fab City initiatives",
  "What are the key principles of Fab City?"
];

const ChatInterface = () => {
  // API URL for the chat interface
  // 'https://fab-city-express-1.onrender.com' ||http://localhost:3001
  const apiUrl = 'https://fab-city-express-1.onrender.com';
  const logoUrl = '/fab-city-logo.png';

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [domain, setDomain] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [showLocationBanner, setShowLocationBanner] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const errorTimeoutRef = useRef(null);


  // Generate session ID and capture domain when component mounts
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      console.warn('Geolocation is not supported by this browser');
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(userLocation);
        setLocationPermission('granted');
        setShowLocationBanner(false);
        //console.log('📍 Location captured:', userLocation);
      },
      (err) => {
        console.warn('Location access denied:', err.message);
        setLocationPermission('denied');
        setShowLocationBanner(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Auto-dismiss location banner after 4 seconds
  useEffect(() => {
    if (showLocationBanner && locationPermission === 'prompt') {
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
      .map(msg => `**${msg.sender === "user" ? "User" : "AI"}**: ${msg.text}`)
      .join("\n");

      const payload = {
        sessionId,
        domain,
        totalMessages: latestMessages.length,
        conversation: formattedConversation,
        timestamp: new Date().toISOString(),
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleTypingComplete = (messageId) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isTyped: true } : msg
    ));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        message: userMessage.text,
        sessionId: sessionId,
        domain: domain
      };

      if (location) {
        requestBody.location = location;
        //console.log('📍 Sending location to backend:', location);
      } else {
        //console.log('⚠️ No location available to send');
      }

      //console.log('📤 Full request body:', requestBody);

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      //console.log('📥 Received from backend:', data);

      let responseText = '';
      if (Array.isArray(data) && data.length > 0) {
        responseText = data[0].output || data[0].response || data[0].message || '';
      } else if (typeof data === 'object') {
        responseText = data.response || data.message || data.output || '';
      } else if (typeof data === 'string') {
        responseText = data;
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: responseText || 'Sorry, I couldn\'t process that.',
        sender: 'ai',
        timestamp: new Date(),
        isTyped: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get response. Please try again.');
      const errorMessage = {
        id: Date.now() + 1,
        text: '⚠️ Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLinkClick = (url) => {
    setPreviewUrl(url);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <div className="h-screen w-full bg-white flex flex-col">
        {/* Header */}
        <div className="relative bg-white sticky top-0 z-10">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-fabcity-green"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                  <img src={logoUrl} alt="Fab City Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Fab City Assistant</h1>
                  <p className="text-sm text-gray-500">Your guide to urban innovation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Permission Banner */}
        <AnimatePresence>
          {showLocationBanner && locationPermission === 'prompt' && (
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
                    We use your location to personalize answers with Fab City initiatives and resources near you
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
                  <img src={logoUrl} alt="Fab City Logo" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
                  Welcome to Fab City
                </h2>
                <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
                  Your intelligent assistant for exploring sustainable urban innovation,
                  circular manufacturing, and the future of cities.
                </p>
                {location && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                    <MapPin size={16} />
                    <span>Location enabled - answers personalized for your area</span>
                  </div>
                )}
                <div className="w-full max-w-2xl">
                  <p className="text-sm font-medium text-gray-700 mb-4">Suggested questions:</p>
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
                    message={{ ...message, onTypingComplete: handleTypingComplete }}
                    onLinkClick={handleLinkClick}
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
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Fab City..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-fabcity-green focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  rows="1"
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-fabcity-green hover:bg-fabcity-green/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl p-3.5 transition-colors shadow-sm"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Powered by Fab City AI & <span>manymangoes</span> • Press Enter to send
            </p>
          </div>
        </div>

        {/* Rich Preview Modal */}
        {previewUrl && (
          <RichPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
        )}
      </div>
    </>
  );
};

export default ChatInterface;