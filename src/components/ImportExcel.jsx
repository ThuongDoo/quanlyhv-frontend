import { useState } from "react";

function ImportResultModal({ result, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
        <h2 className="font-extrabold text-slate-800 text-base">Kết quả Import</h2>
        <p className="text-sm text-slate-500">{result.message}</p>

        {result.success?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              Thành công ({result.success.length})
            </p>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 divide-y divide-emerald-100">
              {result.success.map((r, i) => (
                <div key={i} className="px-3 py-2 text-xs text-emerald-700">
                  Dòng {r.row ?? r.rowNumber} — {r.email ?? r.phone ?? r.name ?? ""}
                  {r.employeeId ? ` (${r.employeeId})` : ""}
                </div>
              ))}
            </div>
          </div>
        )}

        {result.failed?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
              Thất bại ({result.failed.length})
            </p>
            <div className="rounded-xl bg-red-50 border border-red-200 divide-y divide-red-100">
              {result.failed.map((r, i) => (
                <div key={i} className="px-3 py-2 text-xs text-red-600">
                  Dòng {r.row ?? r.rowNumber} — {r.reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {result.defaultPassword && (
          <p className="text-[11px] text-slate-400">
            Mật khẩu mặc định:{" "}
            <span className="font-bold text-slate-600">{result.defaultPassword}</span>
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

// onImport: async (file) => result  — gọi API và trả về response
// label: text hiển thị trên nút
// defaultPassword: hiển thị trong modal nếu có (vd "123456")
export default function ImportExcel({ onImport, label = "Import Excel", defaultPassword }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    try {
      const res = await onImport(file);
      setResult(defaultPassword ? { ...res, defaultPassword } : res);
    } catch (err) {
      alert(err?.response?.data?.error || "Import thất bại.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <label
        className={`rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold px-4 py-2 transition cursor-pointer ${
          importing ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {importing ? "Đang import..." : label}
        <input
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
          disabled={importing}
        />
      </label>

      {result && (
        <ImportResultModal result={result} onClose={() => setResult(null)} />
      )}
    </>
  );
}
