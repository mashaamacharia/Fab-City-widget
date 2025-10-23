import { motion } from 'framer-motion';

const LoadingIndicator = ({ logoUrl }) => {
  // Use Fab City brand colors from logo
  const colors = ['#16A34A', '#1E40AF', '#DC2626']; // Green, Blue, Red from logo

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Fab City Logo - Small version while loading */}
      <div className="w-12 h-12 rounded-full overflow-hidden mb-4 shadow-md">
        <img 
          src={logoUrl || '/fab-city-logo.png'}
          alt="Fab City Logo" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated dots with wave effect */}
      <div className="flex items-center space-x-2 mb-3">
        {colors.map((color, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={{ scale: 0 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full blur-sm"
              style={{ backgroundColor: color }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
            
            {/* Main dot */}
            <div
              className="w-2.5 h-2.5 rounded-full relative z-10"
              style={{ backgroundColor: color }}
            />
          </motion.div>
        ))}
      </div>

      {/* Animated text */}
      <motion.div
        className="flex items-center space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-sm font-medium text-gray-600">Thinking</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
          className="text-fabcity-accent"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.2 }}
          className="text-fabcity-primary"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.4 }}
          className="text-fabcity-accent"
        >
          .
        </motion.span>
      </motion.div>

      {/* Progress bar */}
      <div className="w-28 h-0.5 bg-gray-100 rounded-full overflow-hidden mt-3">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

// Demo component to show the loader
const Demo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Fab City Assistant
        </h3>
        <LoadingIndicator logoUrl="/fab-city-logo.png" />
      </div>
    </div>
  );
};

export default LoadingIndicator;