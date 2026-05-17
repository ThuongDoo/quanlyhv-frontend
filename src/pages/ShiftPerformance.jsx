import { useState } from "react";
import { shiftPerformanceApi } from "../services/shiftPerformance";
import { SHIFTS, getCurrentShift, getTodayString } from "../constants/shifts";

function getWeekOfMonth(date) {
  const d = new Date(date);
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  return Math.ceil((d.getDate() + startOfMonth.getDay()) / 7);
}

function NumberInput({ label, value, onChange, inputCls = "bg-white border-slate-200" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={(e) => e.target.select()}
        className={`w-full rounded-xl border px-3 py-2.5 text-center text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${inputCls}`}
      />
    </div>
  );
}

function DiemDanhSelect({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Điểm danh</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
      >
        <option value={0}>0</option>
        <option value={0.25}>0.25</option>
        <option value={0.5}>0.5</option>
        <option value={0.75}>0.75</option>
        <option value={1}>1</option>
      </select>
    </div>
  );
}

export default function ShiftPerformance() {
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
    <div className="h-full flex flex-col bg-slate-100 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm">
        <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
          Cập nhật Số liệu Ca làm việc
        </h1>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">

          {/* Thông tin ca */}
          <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 grid grid-cols-4 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Ngày <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tháng</label>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 text-center">
                {thang || "—"}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tuần</label>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 text-center">
                {tuan || "—"}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ca làm</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              >
                {SHIFTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* A + B + C nằm ngang, phân chia bằng đường dọc */}
          <div className="flex divide-x divide-slate-100">
            {/* A. Đầu phễu */}
            <div className="flex-1 px-8 py-6 flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-100 leading-none">A</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Đầu phễu</span>
              </div>
              <div className="flex flex-col gap-3">
                <DiemDanhSelect value={diemDanh} onChange={setDiemDanh} />
                <NumberInput label="Nhắc máy" value={nhacMay} onChange={setNhacMay} inputCls="bg-amber-50 border-amber-200" />
                <NumberInput label="Gọi đặt lịch" value={goiDatLich} onChange={setGoiDatLich} inputCls="bg-sky-50 border-sky-200" />
              </div>
            </div>

            {/* B. Chuyển đổi */}
            <div className="flex-1 px-8 py-6 flex flex-col gap-4 bg-blue-50/30">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-100 leading-none">B</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-500">Chuyển đổi</span>
              </div>
              <div className="flex flex-col gap-3">
                <NumberInput label="Lịch mới" value={lichMoi} onChange={setLichMoi} inputCls="bg-blue-50 border-blue-200" />
                <NumberInput label="HV đến (thực tế)" value={hvDen} onChange={setHvDen} inputCls="bg-teal-50 border-teal-200" />
              </div>
            </div>

            {/* C. Tài chính */}
            <div className="flex-1 px-8 py-6 flex flex-col gap-4 bg-red-50/20">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-red-100 leading-none">C</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-400">Tài chính (VNĐ)</span>
              </div>
              <div className="flex flex-col gap-3">
                <NumberInput label="Doanh số" value={doanhSo} onChange={setDoanhSo} inputCls="bg-white border-slate-200" />
                <NumberInput label="Doanh thu" value={doanhThu} onChange={setDoanhThu} inputCls="bg-red-50 border-red-200" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-8 py-4 flex flex-col gap-3">
            {message?.type === "error" && (
              <div className="rounded-xl px-4 py-2.5 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-extrabold uppercase tracking-widest text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu số liệu ca làm"}
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {message?.type === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-bold text-slate-800 text-center">{message.text}</p>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
