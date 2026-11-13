import React from 'react';
import { useUiStore } from '../../store/uiStore.js';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200',
  error: 'bg-rose-950/90 border-rose-500/30 text-rose-200',
  warning: 'bg-amber-950/90 border-amber-500/30 text-amber-200',
  info: 'bg-indigo-950/90 border-indigo-500/30 text-indigo-200',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const IconComponent = ICONS[toast.type] || Info;
        const styleClass = STYLES[toast.type] || STYLES.info;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-2 ${styleClass}`}
          >
            <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              {toast.title && <h4 className="text-xs font-bold">{toast.title}</h4>}
              <p className="text-xs leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
