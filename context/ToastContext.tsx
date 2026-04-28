"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: string; message: string; type: ToastType; duration: number };

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    setToasts((t) => [...t, { id, message, type, duration }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastContainer() {
  const ctx = useToast();
  const { toasts, removeToast } = ctx;

  const styleFor = (type: ToastType) => {
    switch (type) {
      case "success":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: <CheckCircle2 size={20} /> };
      case "error":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: <AlertTriangle size={20} /> };
      case "warning":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: <AlertTriangle size={20} /> };
      default:
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: <Info size={20} /> };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[999] space-y-2 pointer-events-none">
      {toasts.map((t) => {
        const s = styleFor(t.type);
        return (
          <div key={t.id} className={`${s.bg} ${s.border} ${s.text} border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto`}>
            <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-black tracking-tight leading-tight">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600 ml-2"> <X size={16} /> </button>
          </div>
        );
      })}
    </div>
  );
}
