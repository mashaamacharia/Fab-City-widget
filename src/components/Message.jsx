import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Copy, Check, Trash2, RefreshCw, MoreVertical } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

const Message = ({ message, onLinkClick, handleCitationClick, onCopy, onDelete, isCopied, isLast, onRegenerate }) => {
  const isUser = message.sender === 'user';
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(!isUser && !message.isTyped);
  const [showActions, setShowActions] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const actionsRef = useRef(null);
  const messageRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const longPressTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const SWIPE_THRESHOLD = 80; // Minimum swipe distance to trigger delete
  const LONG_PRESS_DURATION = 500; // ms

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // 🔧 Typing behavior configuration
  const CHARS_PER_TICK = 6;        // Number of characters to reveal per frame
  const BASE_DELAY = 12;           // Base delay between frames in ms
  const RANDOM_VARIATION = 6;      // Random delay variation for natural typing
  const MIN_DELAY = 6;             // Minimum delay in ms

  // 🧠 Adaptive delay: slows down for longer messages
  const getAdaptiveDelay = (char, textLength) => {
    let delay = BASE_DELAY;

    // Adjust based on message length
    if (textLength < 80) delay *= 0.6;       // Short = faster
    else if (textLength > 250) delay *= 0.9; // Long = slightly slower

    // Add subtle pause after punctuation
    if (/[.,!?]/.test(char)) delay *= 1.1;

    // Add a bit of randomness to avoid robotic rhythm
    delay += Math.random() * RANDOM_VARIATION;

    // Ensure delay never drops below MIN_DELAY
    return Math.max(MIN_DELAY, delay);
  };

  const flushTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setDisplayedText(message.text);
    setIsTyping(false);
    if (message.onTypingComplete) {
      message.onTypingComplete(message.id);
    }
  }, [message.id, message.onTypingComplete, message.text]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden && isTyping) {
        flushTyping();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flushTyping, isTyping]);

  // 🖋️ Typing simulation effect
  useEffect(() => {
    if (isUser || message.isTyped) {
      setDisplayedText(message.text);
      setIsTyping(false);
      return;
    }

    let currentText = '';
    let currentIndex = 0;
    setIsTyping(true);

    const typeNextChunk = () => {
      if (currentIndex < message.text.length) {
        const remainingText = message.text.slice(currentIndex);
        const linkMatch = remainingText.match(/^\[([^\]]+)\]\(([^)]+)\)/);

        if (linkMatch) {
          // Type markdown link as a single chunk
          currentText += linkMatch[0];
          currentIndex += linkMatch[0].length;
        } else {
          // Type multiple characters per tick for faster output
          const chunk = message.text.slice(currentIndex, currentIndex + CHARS_PER_TICK);
          currentText += chunk;
          currentIndex += chunk.length;
        }

        setDisplayedText(currentText);

        const lastChar = currentText[currentText.length - 1] || '';
        const delay = getAdaptiveDelay(lastChar, message.text.length);
        typingTimeoutRef.current = setTimeout(typeNextChunk, delay);
      } else {
        flushTyping();
      }
    };

    typeNextChunk();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [flushTyping, isUser, message.text]);

  // 🔗 Extract links for click tracking (optional)
  const extractLinks = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }
    return links;
  };

  const links = extractLinks(displayedText);

  // Swipe to delete gesture handlers
  const handleTouchStart = (e) => {
    if (!onDelete) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    // Long press for quick actions menu
    longPressTimerRef.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setShowActions(true);
    }, LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e) => {
    if (!onDelete) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Cancel long press if user moves
    if (longPressTimerRef.current && (Math.abs(deltaX) > 5 || deltaY > 5)) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Only allow horizontal swipe (not vertical scrolling)
    // Require more horizontal movement than vertical to prevent accidental swipes
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > deltaY * 1.5) {
      e.preventDefault();
      setIsSwiping(true);
      // For user messages, swipe left to delete. For AI messages, swipe right
      const offset = isUser ? Math.min(0, deltaX * 0.8) : Math.max(0, deltaX * 0.8);
      setSwipeOffset(offset);
      
      // Haptic feedback when threshold is reached
      if (Math.abs(offset) > SWIPE_THRESHOLD && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (!onDelete) return;
    
    if (isSwiping) {
      const shouldDelete = Math.abs(swipeOffset) > SWIPE_THRESHOLD;
      
      if (shouldDelete) {
        // Haptic feedback (if available)
        if (navigator.vibrate) {
          navigator.vibrate([50, 30, 50]);
        }
        onDelete();
      }
      
      // Reset swipe state
      setSwipeOffset(0);
      setIsSwiping(false);
    }
  };

  // Detect if device is mobile
  const isMobileDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        x: swipeOffset
      }}
      transition={{ 
        duration: isSwiping ? 0 : 0.3,
        type: isSwiping ? 'spring' : 'tween',
        stiffness: isSwiping ? 300 : undefined,
        damping: isSwiping ? 30 : undefined
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 relative`}
      ref={messageRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'pan-y', // Allow vertical scrolling but handle horizontal swipes
      }}
    >
      {/* Swipe delete indicator */}
      {isSwiping && Math.abs(swipeOffset) > 20 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: Math.min(1, Math.abs(swipeOffset) / SWIPE_THRESHOLD),
            scale: Math.abs(swipeOffset) > SWIPE_THRESHOLD ? 1.1 : 1
          }}
          className={`absolute ${isUser ? 'right-0' : 'left-0'} top-0 bottom-0 flex items-center justify-center ${
            Math.abs(swipeOffset) > SWIPE_THRESHOLD ? 'bg-red-500' : 'bg-red-400'
          } rounded-2xl shadow-lg`}
          style={{
            width: `${Math.min(120, Math.abs(swipeOffset) + 20)}px`,
            zIndex: -1
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <Trash2 size={24} className="text-white" />
            {Math.abs(swipeOffset) > SWIPE_THRESHOLD && (
              <span className="text-xs text-white font-medium">Release</span>
            )}
          </div>
        </motion.div>
      )}
        <div
        className={`group max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl swipeable ${
              isUser
                ? 'bg-gray-800 text-white shadow-md rounded-tl-none'
                : 'bg-[#FDFBF7] text-black border border-gray-200 rounded-tr-none'
        }`}
        style={{
          touchAction: 'pan-y',
          WebkitTouchCallout: 'none'
        }}
      >
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, href, children, ...props }) => {
                const linkText = typeof children === 'string' ? children : children?.toString() || '';
                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (href) {
                        // Prefer handleCitationClick if available (from SmartRAGLayout)
                        if (handleCitationClick) {
                          handleCitationClick(href, linkText);
                        } else if (onLinkClick) {
                          onLinkClick(href, linkText);
                        }
                      }
                    }}
                    className={`inline-flex items-center gap-1 hover:underline ${
                      isUser ? 'text-white' : 'text-fabcity-blue'
                    }`}
                    {...props}
                  >
                    {children}
                    <ExternalLink size={12} className="inline" />
                  </button>
                );
              },
            }}
          >
            {displayedText}
          </ReactMarkdown>

          {isTyping && !isUser && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block ml-1 -mb-1 w-1.5 h-4 bg-fabcity-green"
            />
          )}
        </div>

        <div className={`flex items-center justify-between mt-2 ${isUser ? 'text-white/80' : 'text-gray-500'}`}>
          <div className="text-xs">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="flex items-center gap-1 relative" ref={actionsRef}>
            {/* Copy Button - Always visible on mobile, hover on desktop */}
            {onCopy && (
              <motion.button
                onClick={onCopy}
                className="p-1.5 hover:bg-black/10 active:bg-black/20 rounded transition-colors md:opacity-0 md:group-hover:opacity-100 opacity-100 touch-manipulation"
                title="Copy message"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ minWidth: '44px', minHeight: '44px' }} // Better touch target
              >
                {isCopied ? (
                  <Check size={16} className={isUser ? 'text-white' : 'text-green-600'} />
                ) : (
                  <Copy size={16} className={isUser ? 'text-white/70' : 'text-gray-400'} />
                )}
              </motion.button>
            )}
            {/* Delete Button - Always visible on mobile, hover on desktop */}
            {onDelete && (
              <motion.button
                onClick={onDelete}
                className="p-1.5 hover:bg-black/10 active:bg-black/20 rounded transition-colors md:opacity-0 md:group-hover:opacity-100 opacity-100 touch-manipulation"
                title="Delete message"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ minWidth: '44px', minHeight: '44px' }} // Better touch target
              >
                <Trash2 size={16} className={isUser ? 'text-white/70' : 'text-gray-400'} />
              </motion.button>
            )}
            {/* Regenerate Button (only for last AI message) - Always visible on mobile */}
            {onRegenerate && isLast && !isUser && (
              <motion.button
                onClick={onRegenerate}
                className="px-3 py-1.5 text-xs hover:bg-gray-100 active:bg-gray-200 rounded transition-colors md:opacity-0 md:group-hover:opacity-100 opacity-100 flex items-center gap-1.5 touch-manipulation"
                title="Regenerate response"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ minHeight: '44px' }} // Better touch target
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Regenerate</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
