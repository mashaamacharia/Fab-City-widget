import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const LoadingIndicator = ({ logoUrl }) => {
  // Sequence of short status steps (1s each) before switching to the "writing" phase
  const STEPS = [
    'Thinking...',
    'Searching sources...',
    'Synthesizing answer...',
    'Preparing response...'
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [writingPhase, setWritingPhase] = useState(false);
  const [dots, setDots] = useState(0);

  // Manage progression through steps and dot animation
  useEffect(() => {
    let stepTimer = null;
    if (!writingPhase) {
      stepTimer = setInterval(() => {
        setStepIndex((s) => {
          if (s >= STEPS.length - 1) {
            setWritingPhase(true);
            return s;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => { if (stepTimer) clearInterval(stepTimer); };
  }, [writingPhase]);

  useEffect(() => {
    let dotTimer = null;
    if (writingPhase) {
      dotTimer = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    }
    return () => { if (dotTimer) clearInterval(dotTimer); };
  }, [writingPhase]);

  // Hexagon clip-path
  const hexagonClip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  
  // Three points positioned at 120-degree intervals (top, bottom-left, bottom-right)
  const pointPositions = [
    { angle: 0, color: '#E60122' },      // Red - Top
    { angle: 120, color: '#4F7AE2' },    // Blue - Bottom Left
    { angle: 240, color: '#00AA6C' }     // Green - Bottom Right
  ];
  
  const radius = 36; // Distance from center
  const pointSize = 12; // Size of each point

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Three Spinning Points with Center Logo - Fab City Style */}
      <div className="relative flex items-center justify-center mb-4" style={{ width: '96px', height: '96px' }}>
        {/* Rotating container for the three points */}
        <motion.div
          className="absolute"
          style={{
            width: '100%',
            height: '100%',
            left: 0,
            top: 0
          }}
          animate={{
            rotate: [0, 360, 360, 720]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 0.6, 1] // Spin for 50%, pause for 10%, spin again
          }}
        >
          {/* Three points positioned around the circle */}
          {pointPositions.map((point, index) => {
            const x = Math.cos((point.angle * Math.PI) / 180) * radius;
            const y = Math.sin((point.angle * Math.PI) / 180) * radius;
            
            return (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  width: `${pointSize}px`,
                  height: `${pointSize}px`,
                  left: `calc(50% + ${x}px - ${pointSize / 2}px)`,
                  top: `calc(50% + ${y}px - ${pointSize / 2}px)`,
                  clipPath: hexagonClip,
                  background: point.color,
                  boxShadow: `0 2px 8px ${point.color}40`
                }}
                animate={{
                  scale: [1, 1.3, 1, 1.3, 1],
                  opacity: [0.6, 1, 0.6, 1, 0.6]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.3, 0.5, 0.8, 1],
                  delay: index * 0.1
                }}
              />
            );
          })}
        </motion.div>

        {/* Center hexagon with logo */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            clipPath: hexagonClip,
            background: 'linear-gradient(135deg, #E60122 0%, #4F7AE2 50%, #00AA6C 100%)',
            padding: '2px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '100%',
              height: '100%',
              clipPath: hexagonClip,
              background: '#FDFBF7'
            }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Fab City Logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  clipPath: hexagonClip,
                  background: 'linear-gradient(135deg, #E60122 0%, #4F7AE2 50%, #00AA6C 100%)'
                }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Status text with modern styling */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm font-medium text-gray-700 mb-1">
          {!writingPhase ? (
            <motion.span
              key={stepIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {STEPS[stepIndex]}
            </motion.span>
          ) : (
            <span className="inline-flex items-center gap-1">
              Writing answer
              <motion.span
                key={dots}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {'.'.repeat(dots)}
              </motion.span>
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Please wait...
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingIndicator;