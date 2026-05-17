import { useState, useEffect } from "react";
import { shiftPerformanceApi } from "../services/shiftPerformance";
import {
  PerformanceSummary,
  PerformanceTable,
} from "../components/PerformanceReport";
import { getTodayString } from "../constants/shifts";
import { fmtDate } from "../utils/dateHelpers";

export default function ReportWeek() {
  const [date] = useState(getTodayString);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    shiftPerformanceApi
      .getReportWeek(date)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [date]);

  const weekRange = data ? `${fmtDate(data.weekStart)} → ${fmtDate(data.weekEnd)}` : "—";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
            Báo cáo Tổng kết Tuần
          </h1>
        </div>
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
          {weekRange}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
        {loading ? (
          <p className="text-center text-slate-400 py-20 text-sm">
            Đang tải...
          </p>
        ) : (
          <>
            <PerformanceSummary s={data?.total} title="BÁO CÁO TUẦN" />
            <PerformanceTable
              rows={data?.days ?? []}
              getLabel={(row) => fmtDate(row.date)}
              tableTitle={`Chi tiết từng ngày — ${weekRange}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
