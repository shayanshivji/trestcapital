"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
    >
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={cn("relative bg-white rounded-xl shadow-xl w-full border border-slate-200", sizeStyles[size])}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

export function FormActions({
  onCancel,
  submitLabel = "Save",
}: {
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
      >
        {submitLabel}
      </button>
    </div>
  );
}

const inputClass = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none";
const selectClass = inputClass;
const textareaClass = inputClass + " min-h-[80px] resize-y";

export { inputClass, selectClass, textareaClass };
