import { useState, useEffect } from "react";
import { shiftPerformanceApi } from "../services/shiftPerformance";
import { SHIFTS, getTodayString } from "../constants/shifts";
import LoadingOverlay from "../components/LoadingOverlay";

export default function History() {
  const [date, setDate] = useState(getTodayString);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    shiftPerformanceApi
      .getByDate(date)
      .then((res) => {
        console.log(res);

        setHistory(res.performances ?? []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <LoadingOverlay show={loading} />
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm">
        <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
          Lịch sử Ca làm việc
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Chọn ngày */}
        <div className="flex items-center gap-3">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Ngày
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>

        {/* Bảng */}
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-10">
            Đang tải...
          </p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">
            Chưa có dữ liệu trong ngày này.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3 text-left">Nhân viên</th>
                  <th className="px-4 py-3 text-left">Ca</th>
                  <th className="px-3 py-3 text-center">Điểm danh</th>
                  <th className="px-3 py-3 text-center">Nhắc máy</th>
                  <th className="px-3 py-3 text-center">Gọi lịch</th>
                  <th className="px-3 py-3 text-center">Lịch mới</th>
                  <th className="px-3 py-3 text-center">HV đến</th>
                  <th className="px-3 py-3 text-center">Doanh số</th>
                  <th className="px-3 py-3 text-center">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const shiftLabel =
                    SHIFTS.find((s) => s.value === row.shift)?.label ??
                    row.shift;
                  return (
                    <tr
                      key={row._id ?? row.shift}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 leading-tight">
                          {row.userId?.name || "—"}
                        </p>
                        {row.userId?.employeeId && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {row.userId.employeeId}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-600">
                        {shiftLabel}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.diemDanh ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.nhacMay ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.goiDatLich ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.lichMoi ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.hvDen ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {row.doanhSo?.toLocaleString("vi-VN") ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-red-500">
                        {row.doanhThu?.toLocaleString("vi-VN") ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
