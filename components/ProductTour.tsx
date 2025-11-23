
import React, { useState, useEffect, useRef } from 'react';
import { XIcon, ArrowRightIcon } from './Icons';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'right' | 'bottom' | 'left' | 'top';
}

interface ProductTourProps {
  steps: TourStep[];
  onComplete: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({ steps, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const currentStep = steps[currentStepIndex];

  const updatePosition = () => {
    const element = document.getElementById(currentStep.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      setIsVisible(true);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If element not found, skip or wait. For simplicity, we skip if not found after a delay
      console.warn(`Tour target #${currentStep.targetId} not found`);
    }
  };

  useEffect(() => {
    // Initial small delay to allow UI to render/settle
    const timer = setTimeout(updatePosition, 500);
    window.addEventListener('resize', updatePosition);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
    }
  }, [currentStepIndex, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setIsVisible(false);
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 300); // Wait for fade out
    } else {
      onComplete();
    }
  };

  if (!targetRect) return null;

  // Calculate position for the tooltip
  const getTooltipStyle = () => {
      if (!targetRect) return {};
      const gap = 20;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Determine if target is on the right half of the screen
      const isRightSide = targetRect.left > windowWidth / 2;
      
      const style: React.CSSProperties = {};

      switch (currentStep.position) {
          case 'right':
              style.left = targetRect.right + gap;
              style.top = targetRect.top;
              // Prevent vertical overflow at bottom
              if (targetRect.top + 200 > windowHeight) {
                  style.top = 'auto';
                  style.bottom = 20;
              }
              break;
          case 'left':
              style.right = windowWidth - targetRect.left + gap;
              style.top = targetRect.top;
              break;
          case 'bottom':
              style.top = targetRect.bottom + gap;
              if (isRightSide) {
                  // Align right edge of tooltip with right edge of target to prevent overflow
                  style.right = windowWidth - targetRect.right;
                  style.left = 'auto';
              } else {
                  style.left = targetRect.left;
              }
              break;
          case 'top':
              style.bottom = windowHeight - targetRect.top + gap;
              if (isRightSide) {
                  style.right = windowWidth - targetRect.right;
                  style.left = 'auto';
              } else {
                  style.left = targetRect.left;
              }
              break;
          default:
              style.top = targetRect.bottom + gap;
              style.left = targetRect.left;
      }
      
      return style;
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Mask Overlay - Constructed using 4 divs around the target to create the "hole" */}
      <div className="absolute top-0 left-0 right-0 bg-black/70 transition-all duration-500 ease-in-out" style={{ height: targetRect.top }} />
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 transition-all duration-500 ease-in-out" style={{ top: targetRect.bottom }} />
      <div className="absolute left-0 bg-black/70 transition-all duration-500 ease-in-out" style={{ top: targetRect.top, height: targetRect.height, width: targetRect.left }} />
      <div className="absolute right-0 bg-black/70 transition-all duration-500 ease-in-out" style={{ top: targetRect.top, height: targetRect.height, left: targetRect.right }} />

      {/* Highlight Border */}
      <div 
        className="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-500 ease-in-out pointer-events-none box-content"
        style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
        }}
      />

      {/* Tooltip Card */}
      <div 
        className={`absolute w-80 max-w-[calc(100vw-2rem)] bg-[#1A1A1F] border border-white/20 rounded-xl p-5 shadow-2xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={getTooltipStyle()}
      >
          <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
              <button onClick={onComplete} className="text-gray-500 hover:text-white">
                  <XIcon className="w-4 h-4" />
              </button>
          </div>
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              {currentStep.content}
          </p>
          <div className="flex justify-between items-center">
              <div className="flex gap-1">
                  {steps.map((_, idx) => (
                      <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentStepIndex ? 'bg-blue-500' : 'bg-gray-700'}`} />
                  ))}
              </div>
              <button 
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                  {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRightIcon className="w-3 h-3" />
              </button>
          </div>
      </div>
    </div>
  );
};
