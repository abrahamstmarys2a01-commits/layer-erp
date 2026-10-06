import React, { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md', // sm, md, lg, xl, full, fullscreen
  showClose = true,
  allowFullscreenToggle = true,
  defaultFullscreen = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(defaultFullscreen || size === 'fullscreen');

  useEffect(() => {
    setIsFullscreen(defaultFullscreen || size === 'fullscreen');
  }, [defaultFullscreen, size, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl w-full',
    fullscreen: 'w-full max-w-6xl'
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-3 sm:p-5'} overflow-y-auto`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative bg-white shadow-2xl border border-slate-200/80 flex flex-col transform transition-all z-10 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none my-0 max-w-none'
            : `w-full ${sizeClasses[size] || 'max-w-lg'} rounded-2xl my-4 sm:my-8 max-h-[92vh]`
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div>
              {title && <h3 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            
            <div className="flex items-center gap-1.5">
              {allowFullscreenToggle && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-slate-400 hover:text-navy-900 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors focus:outline-none"
                  title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}

              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors focus:outline-none ml-0.5"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
