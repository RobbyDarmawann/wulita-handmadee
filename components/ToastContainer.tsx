"use client";

import { useToast, type ToastType } from "@/context/ToastContext";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const typeConfig: Record<
  ToastType,
  { icon: React.ReactNode; bg: string; border: string; text: string }
> = {
  success: {
    icon: <CheckCircle2 size={20} />,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
  },
  error: {
    icon: <AlertCircle size={20} />,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
  },
  info: {
    icon: <Info size={20} />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[999] space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type];
        return (
          <div
            key={toast.id}
            className={`${config.bg} ${config.border} ${config.text} border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto`}
          >
            <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
