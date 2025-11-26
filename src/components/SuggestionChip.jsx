import { motion } from 'framer-motion';

const SuggestionChip = ({ text, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(text)}
      className="text-sm text-gray-900 font-medium p-0 bg-transparent border-0 rounded-none shadow-none hover:underline cursor-pointer text-left transition-colors focus:outline-none"
    >
      {text}
    </motion.button>
  );
};

export default SuggestionChip;

