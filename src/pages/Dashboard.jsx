import { useCallback, useEffect, useState } from "react";
import { studentApi } from "../services/students";
import { authApi } from "../services/auth";
import { useDebounce } from "../hooks/useDebounce";
import StudentCard from "../components/StudentCard";
import { classificationConfig, statusConfig } from "../constants/studentConfig";

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

export default function Dashboard() {
  const today = toDateInput(new Date());

  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduledAtFrom, setScheduledAtFrom] = useState(today);
  const [scheduledAtTo, setScheduledAtTo] = useState("");
  const [selectedClassification, setSelectedClassification] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (scheduledAtFrom) params.scheduledAtFrom = scheduledAtFrom;
      if (scheduledAtTo) params.scheduledAtTo = scheduledAtTo;
      if (selectedClassification !== "") params.clasification = selectedClassification;
      if (selectedStatus !== "") params.status = selectedStatus;
      const response = await studentApi.fetchStudents(params);
      setStudents(response.students || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [scheduledAtFrom, scheduledAtTo, selectedClassification, selectedStatus]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    authApi
      .fetchUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : data.users || []))
      .catch(() => {});
  }, []);

  const search = useDebounce(searchInput);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.phone?.includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        {/* Row 1: title + controls */}
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
              Matrix View: Ma Trận Ưu Tiên CRM
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Đồng bộ lúc:{" "}
              <span className="text-blue-500 font-semibold">{timeStr}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <label className="font-medium shrink-0 text-xs">Từ</label>
              <input
                type="date"
                value={scheduledAtFrom}
                onChange={(e) => setScheduledAtFrom(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <label className="font-medium shrink-0 text-xs">Đến</label>
              <input
                type="date"
                value={scheduledAtTo}
                onChange={(e) => setScheduledAtTo(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Tìm tên, SĐT..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-44 transition"
              />
            </div>
          </div>
        </div>

        {/* Row 2: legend + toggle */}
        <div className="px-6 py-2 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 bg-slate-50">
          {/* Phân loại */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Phân loại</span>
            <button
              onClick={() => setSelectedClassification("")}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition ${selectedClassification === "" ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-500 border-slate-300 hover:border-slate-400"}`}
            >
              Tất cả
            </button>
            {Object.entries(classificationConfig).map(([key, cfg]) => {
              const active = selectedClassification === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedClassification(active ? "" : key)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition ${active ? cfg.className : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"}`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-4 bg-slate-200 shrink-0" />

          {/* Trạng thái */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Trạng thái</span>
            <button
              onClick={() => setSelectedStatus("")}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition ${selectedStatus === "" ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-500 border-slate-300 hover:border-slate-400"}`}
            >
              Tất cả
            </button>
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const active = selectedStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedStatus(active ? "" : key)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition ${active ? cfg.className : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"}`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
        {loading ? (
          <div className="text-center text-slate-400 py-20 text-sm">
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-20 text-sm">
            Không tìm thấy học sinh nào.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((s) => (
                <StudentCard key={s._id || s.id} student={s} users={users} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
