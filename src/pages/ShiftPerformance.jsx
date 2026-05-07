import { useState } from "react";
import { shiftPerformanceApi } from "../services/shiftPerformance";
import { SHIFTS, getCurrentShift, getTodayString } from "../constants/shifts";

function getWeekOfMonth(date) {
  const d = new Date(date);
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  return Math.ceil((d.getDate() + startOfMonth.getDay()) / 7);
}

function NumberInput({ label, value, onChange, highlight }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-[11px] font-bold uppercase tracking-widest ${highlight || "text-slate-500"}`}>
        {label}
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full rounded-xl border px-4 py-3 text-center text-lg font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition ${highlight ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}
      />
    </div>
  );
}

export default function ShiftPerformance() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const [date, setDate] = useState(getTodayString);
  const [shift, setShift] = useState(getCurrentShift);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // A. Đầu phễu
  const [diemDanh, setDiemDanh] = useState(0);
  const [nhacMay, setNhacMay] = useState(0);
  const [goiDatLich, setGoiDatLich] = useState(0);

  // B. Chuyển đổi
  const [lichMoi, setLichMoi] = useState(0);
  const [hvDen, setHvDen] = useState(0);

  // C. Tài chính
  const [doanhSo, setDoanhSo] = useState(0);
  const [doanhThu, setDoanhThu] = useState(0);

  const parsedDate = date ? new Date(date) : null;
  const thang = parsedDate ? parsedDate.getMonth() + 1 : "";
  const tuan = parsedDate ? getWeekOfMonth(parsedDate) : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setMessage({ type: "error", text: "Vui lòng chọn ngày." });
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      await shiftPerformanceApi.create({
        date,
        shift,
        diemDanh,
        nhacMay,
        goiDatLich,
        lichMoi,
        hvDen,
        doanhSo,
        doanhThu,
      });
      setMessage({ type: "success", text: "Lưu số liệu ca làm thành công!" });
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.error || err?.message || "Lưu thất bại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm">
        <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
          Cập nhật Số liệu Ca làm việc
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Đồng bộ lúc: <span className="text-blue-500 font-semibold">{timeStr}</span>
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">

          {/* Thông tin ca */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Ngày <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tháng</label>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 text-center font-semibold">
                {thang || "—"}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tuần</label>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 text-center font-semibold">
                {tuan || "—"}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ca làm</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              >
                {SHIFTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* A. Đầu phễu */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-slate-700">A. ĐẦU PHỄU</h2>
            <div className="grid grid-cols-3 gap-4">
              <NumberInput label="Điểm danh" value={diemDanh} onChange={setDiemDanh} />
              <NumberInput label="Nhắc máy" value={nhacMay} onChange={setNhacMay} highlight="text-amber-500" />
              <NumberInput label="Gọi đặt lịch" value={goiDatLich} onChange={setGoiDatLich} highlight="text-blue-500" />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* B. Chuyển đổi */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-blue-600">B. CHUYỂN ĐỔI</h2>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Lịch mới" value={lichMoi} onChange={setLichMoi} highlight="text-blue-400" />
              <NumberInput label="HV đến (thực tế)" value={hvDen} onChange={setHvDen} highlight="text-teal-500" />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* C. Tài chính */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-red-500">C. TÀI CHÍNH (VNĐ)</h2>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Doanh số" value={doanhSo} onChange={setDoanhSo} />
              <NumberInput label="Doanh thu" value={doanhThu} onChange={setDoanhThu} highlight="text-red-400" />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-base font-extrabold uppercase tracking-widest text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu số liệu ca làm"}
          </button>
        </form>
      </div>
    </div>
  );
}
