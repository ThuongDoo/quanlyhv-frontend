import { useState } from "react";
import * as XLSX from "xlsx";

function ImportResultModal({ result, onClose }) {
  const successList = result.success ?? result.successful ?? [];
  const failedList = result.failed ?? [];
  const allSuccess = successList.length > 0 && failedList.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
        <h2 className="font-extrabold text-slate-800 text-base">Kết quả Import</h2>

        {allSuccess ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-emerald-700 text-sm">Import thành công!</p>
              <p className="text-xs text-emerald-600">{result.message}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">{result.message}</p>
        )}

        {successList.length > 0 && !allSuccess && (
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              Thành công ({successList.length})
            </p>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 divide-y divide-emerald-100">
              {successList.map((r, i) => (
                <div key={i} className="px-3 py-2 text-xs text-emerald-700">
                  Dòng {r.row ?? r.rowNumber} — {r.email ?? r.phone ?? r.name ?? ""}
                  {r.employeeId ? ` (${r.employeeId})` : ""}
                </div>
              ))}
            </div>
          </div>
        )}

        {failedList.length > 0 && (
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
              Thất bại ({failedList.length})
            </p>
            <div className="rounded-xl bg-red-50 border border-red-200 divide-y divide-red-100">
              {failedList.map((r, i) => (
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

        <button onClick={onClose}
          className={`w-full rounded-xl py-2.5 text-sm font-semibold transition ${allSuccess ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}>
          Đóng
        </button>
      </div>
    </div>
  );
}

// templateColumns: [{ key: "name", example: "Nguyễn Văn A" }, ...]
export default function ImportExcel({ onImport, label = "Import Excel", defaultPassword, templateColumns, templateFilename = "mau_import" }) {
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

  const downloadTemplate = () => {
    const header = templateColumns.map((c) => c.key);
    const example = templateColumns.map((c) => c.example ?? "");
    const ws = XLSX.utils.aoa_to_sheet([header, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${templateFilename}.xlsx`);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {templateColumns && (
          <button
            type="button"
            onClick={downloadTemplate}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 text-xs font-semibold px-3 py-2 transition"
            title="Tải file mẫu"
          >
            ⬇ Mẫu
          </button>
        )}
        <label className={`rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold px-4 py-2 transition cursor-pointer ${importing ? "opacity-50 pointer-events-none" : ""}`}>
          {importing ? "Đang import..." : label}
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleChange} disabled={importing} />
        </label>
      </div>

      {result && (
        <ImportResultModal result={result} onClose={() => setResult(null)} />
      )}
    </>
  );
}
