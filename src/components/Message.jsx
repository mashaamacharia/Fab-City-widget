import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

const Message = ({ message, onLinkClick }) => {
  const isUser = message.sender === 'user';
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(!isUser && !message.isTyped);

  // 🔧 Typing behavior configuration
  const BASE_SPEED = 4;           // Lower = faster typing (e.g., 5 = very fast, 20 = slower)
  const RANDOM_VARIATION = 4;     // Random delay variation for natural typing
  const MIN_DELAY = 2;            // Minimum delay cap

  // 🧠 Adaptive delay: slows down for longer messages
  const getAdaptiveDelay = (char, textLength) => {
    let delay = BASE_SPEED;

    // Adjust based on message length
    if (textLength < 50) delay *= 0.5;      // Short = faster
    else if (textLength > 200) delay *= 0.7; // Long = slower

    // Add natural pauses after punctuation
    if (/[.,!?]/.test(char)) delay *= 1;

    // Add a bit of randomness to avoid robotic rhythm
    delay += Math.random() * RANDOM_VARIATION;

    // Ensure delay never drops below MIN_DELAY
    return Math.max(MIN_DELAY, delay);
  };

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

    const typeNextCharacter = () => {
      if (currentIndex < message.text.length) {
        const remainingText = message.text.slice(currentIndex);
        const linkMatch = remainingText.match(/^\[([^\]]+)\]\(([^)]+)\)/);

        if (linkMatch) {
          // Type markdown link as a single chunk
          currentText += linkMatch[0];
          currentIndex += linkMatch[0].length;
        } else {
          // Type one character
          currentText += message.text[currentIndex];
          currentIndex++;
        }

        setDisplayedText(currentText);

        const delay = getAdaptiveDelay(message.text[currentIndex - 1], message.text.length);
        setTimeout(typeNextCharacter, delay);
      } else {
        setIsTyping(false);
        if (message.onTypingComplete) {
          message.onTypingComplete(message.id);
        }
      }
    };

    typeNextCharacter();
  }, [message.text, isUser]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl ${
          isUser
            ? 'bg-fabcity-green text-white shadow-md '
            : 'bg-gray-100 text-black border border-fabcity-blue/30'
        }`}
      >
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, href, children, ...props }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (href && onLinkClick) {
                      onLinkClick(href);
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
              ),
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

        <div className={`text-xs mt-1 ${isUser ? 'text-white/80' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
