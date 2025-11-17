import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ChatWidgetButton from "./ChatWidgetButton";
import ChatInterface from "./ChatWidget";

const ChatWidgetContainer = ({ isWidgetMode = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  // If not in widget mode, just render the full-page interface
  if (!isWidgetMode) {
    return <ChatInterface />;
  }

  return (
    <>
      {/* Widget Button */}
      <AnimatePresence>
        {!isOpen && <ChatWidgetButton onClick={() => setIsOpen(true)} />}
      </AnimatePresence>

      {/* Full-page Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
            onClick={(e) => {
              // Close when clicking the backdrop (but not the content)
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              onClick={() => setIsOpen(false)}
              className="z-[101] w-10 h-10 rounded-full fabcity-close-button flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm group"
              aria-label="Close chat"
            >
              <div className="absolute inset-0 rounded-full fabcity-close-pulse"></div>
              <X size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
            </motion.button>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatInterface />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidgetContainer;

