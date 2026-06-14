import { useState, useEffect } from "react";
import { shiftPerformanceApi } from "../services/shiftPerformance";
import { authApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import {
  PerformanceSummary,
  PerformanceTable,
} from "../components/PerformanceReport";
import { MONTHS } from "../constants/studentConfig";
import LoadingOverlay from "../components/LoadingOverlay";

const now = new Date();

export default function ReportMonth() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
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
      .getReportMonth(month, year, isAdmin ? selectedUserId : undefined)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [month, year, isAdmin, selectedUserId]);

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <LoadingOverlay show={loading} />
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
            Báo cáo Tổng kết Tháng
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Tất cả</option>
              {users.map((u) => (
                <option key={u._id || u.id} value={u._id || u.id}>
                  {u.name || u.username || u.email}
                </option>
              ))}
            </select>
          )}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
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
    </div>
  );
}
