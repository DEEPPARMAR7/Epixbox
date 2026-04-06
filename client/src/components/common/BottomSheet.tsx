import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-12 duration-300">
        <div className="bg-card border-t border-border rounded-t-2xl shadow-2xl">
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-border rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h2 className="font-heading font-semibold text-lg text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            {children}
          </div>

          {/* Safe Area Bottom */}
          <div className="h-4 sm:h-0" />
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
