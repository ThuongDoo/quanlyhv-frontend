import { createPortal } from "react-dom";

export default function FilterDropdown({ rect, options, selected, onToggle, onClear }) {
  if (!rect) return null;

  const style = {
    position: "fixed",
    top: rect.bottom + 4,
    left: rect.left,
    zIndex: 9999,
  };

  return createPortal(
    <div style={style} className="min-w-[190px] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      <div className="max-h-56 overflow-y-auto p-1.5">
        {options.length === 0 ? (
          <div className="px-3 py-2 text-sm text-slate-400">Không có dữ liệu</div>
        ) : (
          options.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => onToggle(value)}
                className="rounded border-slate-300 accent-indigo-600"
              />
              <span className="truncate">{label}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <div className="border-t border-slate-100 p-1.5">
          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-xl px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
          >
            Xóa lọc ({selected.length})
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
