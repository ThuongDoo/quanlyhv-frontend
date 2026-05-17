import { useRef } from "react";

export default function DateInput({ value, onChange, className = "", min }) {
  const inputRef = useRef(null);

  const formatted = value
    ? value.split("-").reverse().join("/")
    : "—";

  return (
    <div
      className={`relative flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 cursor-pointer select-none focus-within:ring-2 focus-within:ring-blue-200 rounded-full ${className}`}
      onClick={() => inputRef.current?.showPicker?.()}
    >
      <span>{formatted}</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        className="absolute inset-0 opacity-0 w-full cursor-pointer"
      />
    </div>
  );
}
