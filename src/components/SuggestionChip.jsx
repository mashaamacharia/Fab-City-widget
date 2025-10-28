import { motion } from 'framer-motion';

const SuggestionChip = ({ text, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(text)}
      className="px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-fabcity-green hover:bg-fabcity-green/5 transition-colors text-left text-sm text-gray-700 shadow-sm"
    >
      {text}
    </motion.button>
  );
};

export default SuggestionChip;

