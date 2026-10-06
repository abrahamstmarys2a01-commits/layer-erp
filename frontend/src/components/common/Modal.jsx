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
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    full: 'sm:max-w-6xl',
    fullscreen: 'max-w-none'
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-3 sm:p-5'} overflow-y-auto`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className={`relative bg-white shadow-2xl border border-slate-200/80 flex flex-col transform transition-all z-10 w-[calc(100vw-24px)] ${
          isFullscreen
            ? 'w-screen h-screen rounded-none my-0 max-w-none'
            : `${sizeClasses[size] || 'sm:max-w-lg'} rounded-2xl sm:rounded-3xl my-auto max-h-[90vh]`
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl sm:rounded-t-3xl shrink-0">
            <div className="min-w-0 mr-2">
              {title && <h3 className="text-sm sm:text-base font-bold text-navy-900 tracking-tight truncate">{title}</h3>}
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {allowFullscreenToggle && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hidden sm:flex text-slate-400 hover:text-navy-900 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors focus:outline-none"
                  title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}

              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors focus:outline-none touch-target flex items-center justify-center cursor-pointer"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 sm:p-8 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
