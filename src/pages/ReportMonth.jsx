import { useState, useEffect } from "react";
import { shiftPerformanceApi } from "../services/shiftPerformance";
import { PerformanceSummary, PerformanceTable } from "../components/PerformanceReport";

const now = new Date();

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

export default function ReportMonth() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  useEffect(() => {
    setLoading(true);
    shiftPerformanceApi
      .getReportMonth(month, year)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [month, year]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">Báo cáo Tổng kết Tháng</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Đồng bộ lúc: <span className="text-blue-500 font-semibold">{timeStr}</span>
          </p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        {loading ? (
          <p className="text-center text-slate-400 py-20 text-sm">Đang tải...</p>
        ) : (
          <>
            <PerformanceSummary s={data?.total} title="BÁO CÁO THÁNG" />
            <PerformanceTable
              rows={data?.weeks ?? []}
              getLabel={(row) => `Tuần ${row.week}`}
              tableTitle={`Tổng kết Phễu các Tuần — Tháng ${month}/${year}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
