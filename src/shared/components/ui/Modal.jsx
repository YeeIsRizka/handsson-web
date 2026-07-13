import React, { useEffect } from "react";
import Button from "./Button";

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  maxWidth = "max-w-xl" 
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-8 animate-fade-in">
      <div 
        className={`bg-neo-bg border-brutal shadow-brutal-lg w-full ${maxWidth} flex flex-col max-h-[95vh]`}
      >

        <div className="flex justify-between items-center p-5 border-b-[3px] border-neo-border bg-neo-yellow">
          <h2 className="text-2xl font-black uppercase tracking-wider">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-neo-red border-brutal shadow-brutal-sm hover:bg-red-400 active:active-brutal-sm transition-all"
            aria-label="Tutup"
          >
            <span className="text-white text-2xl font-black leading-none translate-y-[-2px]">&times;</span>
          </button>
        </div>


        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>


        {footer && (
          <div className="p-5 border-t-[3px] border-neo-border bg-gray-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
