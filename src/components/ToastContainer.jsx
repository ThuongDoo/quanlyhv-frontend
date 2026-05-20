import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ToastCtx = createContext(null);

const STYLES = {
  error:   "bg-red-600 text-white",
  success: "bg-emerald-600 text-white",
  info:    "bg-slate-800 text-white",
};

const ICONS = { error: "✕", success: "✓", info: "ℹ" };

function Toast({ id, type, msg, onDismiss }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold max-w-sm w-full ${STYLES[type]}`}>
      <span className="mt-0.5 shrink-0 font-bold">{ICONS[type]}</span>
      <span className="flex-1 leading-snug">{msg}</span>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition text-base leading-none ml-1"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, msg) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  // Cho phép code ngoài React (vd: api.js) dispatch toast qua window event
  useEffect(() => {
    const handler = (e) => addToast(e.detail.type ?? "info", e.detail.msg ?? "");
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, [addToast]);

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const add = useContext(ToastCtx);
  return {
    error:   (msg) => add("error", msg),
    success: (msg) => add("success", msg),
    info:    (msg) => add("info", msg),
  };
}
