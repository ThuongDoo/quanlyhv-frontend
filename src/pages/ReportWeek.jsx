import { useState, useEffect } from "react";
import { shiftPerformanceApi } from "../services/shiftPerformance";
import { authApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import {
  PerformanceSummary,
  PerformanceTable,
} from "../components/PerformanceReport";
import { getTodayString } from "../constants/shifts";
import { fmtDate } from "../utils/dateHelpers";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ReportWeek() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [date] = useState(getTodayString);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    authApi
      .fetchUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : data.users || []))
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    setLoading(true);
    shiftPerformanceApi
      .getReportWeek(date, isAdmin ? selectedUserId : undefined)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [date, isAdmin, selectedUserId]);

  const weekRange = data ? `${fmtDate(data.weekStart)} → ${fmtDate(data.weekEnd)}` : "—";

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <LoadingOverlay show={loading} />
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
            Báo cáo Tổng kết Tuần
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="">Tất cả</option>
              {users.map((u) => (
                <option key={u._id || u.id} value={u._id || u.id}>
                  {u.name || u.username || u.email}
                </option>
              ))}
            </select>
          )}
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
            {weekRange}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
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
    </div>
  );
}
