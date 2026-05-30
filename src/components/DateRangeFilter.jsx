import { createPortal } from "react-dom";

export default function DateRangeFilter({ rect, from, to, onChange, onClear }) {
  if (!rect) return null;

  const style = {
    position: "fixed",
    top: rect.bottom + 4,
    left: rect.left,
    zIndex: 9999,
  };

  const hasValue = from || to;

  return createPortal(
    <div style={style} className="min-w-[220px] rounded-2xl border border-slate-200 bg-white shadow-xl p-3 flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500">Từ ngày</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500">Đến ngày</label>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      {hasValue && (
        <div className="border-t border-slate-100 pt-2 mt-1">
          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-xl px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
          >
            Xóa lọc
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
