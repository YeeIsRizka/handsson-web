import React, { useEffect } from "react";
import Button from "./Button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export default function ConfirmModal({ 
  isOpen, 
  title, 
  description, 
  confirmText = "OK", 
  cancelText = "Batal", 
  onConfirm, 
  onCancel,
  icon = null
}) {

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

  const defaultIcon = <ExclamationTriangleIcon className="w-14 h-14 text-neo-red" />;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white border-brutal shadow-[8px_8px_0px_0px_#000] max-w-sm w-full flex flex-col p-8 text-center">
        <div className="text-6xl mb-4 rotate-6 hover:-rotate-6 transition-transform flex items-center justify-center">{icon || defaultIcon}</div>
        <h2 className="text-2xl font-black uppercase text-neo-text mb-3">{title}</h2>
        <div className="text-neo-text font-bold mb-8 text-base border-2 border-dashed border-neo-border p-3">
          {description}
        </div>
        <div className="flex gap-4 w-full">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1 py-3 text-lg bg-gray-100">{cancelText}</Button>
          )}
          <Button variant="danger" onClick={onConfirm} className="flex-1 py-3 text-lg">{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
