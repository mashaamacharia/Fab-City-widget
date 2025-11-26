import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const LoadingIndicator = ({ logoUrl }) => {
  // Tailwind-first implementation with minimal inline styles for clip-path and calc-based sizing
  const styleVars = {
    '--hex-size': '28px',
    '--gap': '2.4px',
    '--hex-width': 'calc(28px * 0.866)',
    '--hex-height': '28px',
  };

  const clip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

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

  // Transforms for the three outer hexagons (approx positions)
  const outerTransforms = [
    'rotate(30deg) translate(calc(var(--hex-width) + var(--gap))) rotate(-30deg)',
    'rotate(150deg) translate(calc(var(--hex-width) + var(--gap))) rotate(-150deg)',
    'rotate(270deg) translate(calc(var(--hex-width) + var(--gap))) rotate(-270deg)',
  ];

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

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={styleVars}>
        {/* Spinner ring */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin">
          {outerTransforms.map((t, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: 'var(--hex-width)',
                height: 'var(--hex-height)',
                clipPath: clip,
                transform: t,
                backgroundColor: i === 0 ? '#151618ff' : i === 1 ? '#080808ff' : '#080808ff',
                boxShadow: '0 0 8px rgba(255,255,255,0.06)',
              }}
            />
          ))}
        </div>

        {/* Center hex — no white background, just 3D floating logo */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 'var(--hex-width)',
            height: 'var(--hex-height)',
            clipPath: clip,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15)) drop-shadow(0 0 20px rgba(0,99,191,0.2))',
            transform: 'perspective(1000px) rotateX(5deg) rotateY(5deg)',
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Fab City Logo"
              className="object-contain"
              style={{ width: '68%', height: '68%' }}
            />
          ) : (
            <div className="text-sm font-black leading-none text-black flex flex-col items-center">
              <span>FAB</span>
              <span>CITY</span>
            </div>
          )}
        </div>
      </div>

      {/* Status text: cycle through STEPS each 1s, then show Writing... with animated dots */}
      <div className="mt-3 text-center text-xs text-gray-600">
        {!writingPhase ? (
          <span>{STEPS[stepIndex]}</span>
        ) : (
          <span>Writing answer{'.'.repeat(dots)}</span>
        )}
      </div>
    </div>
  );
};

// Manage progression through steps and dot animation
export default LoadingIndicator;