import { motion } from 'framer-motion';

const SuggestionChip = ({ text, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(text)}
      className="px-4 py-3 bg-black border border-gray-600 rounded-xl hover:bg-white hover:text-black hover:border-gray-400 transition-colors text-left text-sm text-white shadow-sm"
    >
      {text}
    </motion.button>
  );
};

export default SuggestionChip;

