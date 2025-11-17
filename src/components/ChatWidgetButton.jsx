import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const ChatWidgetButton = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 group md:bottom-8 md:right-8"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      aria-label="Open Fab City AI Chat"
    >
      {/* Outer pulsing ring */}
      <div className="absolute inset-0 rounded-full fabcity-pulse-ring"></div>
      
      {/* Middle glowing ring */}
      <div className="absolute inset-0 rounded-full fabcity-glow-ring"></div>
      
      {/* Main button */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full fabcity-widget-button flex items-center justify-center shadow-2xl">
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white z-10" strokeWidth={2.5} />
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-full fabcity-inner-glow"></div>
        
        {/* Subtle notification indicator */}
        <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-fabcity-green rounded-full border border-white/80 shadow-lg"></div>
      </div>
      
      {/* Tooltip - hidden on mobile, shown on desktop */}
      <div className="hidden md:block absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-gray-700">
          Chat with Fab City AI
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </div>
    </motion.button>
  );
};

export default ChatWidgetButton;

