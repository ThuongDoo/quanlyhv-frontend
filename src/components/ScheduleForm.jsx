import { useState } from "react";
import DateInput from "./DateInput";

export default function ScheduleForm({ date, hour, minute, consultantId, users, onDateChange, onHourChange, onMinuteChange, onConsultantChange, onSave, onCancel, saving }) {
  const [attempted, setAttempted] = useState(false);

  const errors = {
    date: !date,
    hour: !hour,
    consultantId: !consultantId,
  };
  const hasError = Object.values(errors).some(Boolean);

  const handleSave = () => {
    setAttempted(true);
    if (hasError) return;
    onSave();
  };

  const err = (field) => attempted && errors[field];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">
          Ngày hẹn <span className="text-red-500">*</span>
        </label>
        <DateInput
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className={`rounded-xl ${err("date") ? "border-red-300 ring-1 ring-red-200" : ""}`}
        />
        {err("date") && <p className="text-xs text-red-400">Vui lòng chọn ngày hẹn</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">
          Giờ hẹn <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <select
            value={hour}
            onChange={(e) => onHourChange(e.target.value)}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 bg-white transition ${err("hour") ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}`}
          >
            <option value="">--</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>
            ))}
          </select>
          <span className="font-bold text-slate-400">:</span>
          <select
            value={minute}
            onChange={(e) => onMinuteChange(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
          >
            {["00", "15", "30", "45"].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {err("hour") && <p className="text-xs text-red-400">Vui lòng chọn giờ hẹn</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">
          Tư vấn viên <span className="text-red-500">*</span>
        </label>
        <select
          value={consultantId}
          onChange={(e) => onConsultantChange(e.target.value)}
          className={`rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 bg-white transition ${err("consultantId") ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"}`}
        >
          <option value="">-- Chọn tư vấn viên --</option>
          {users.filter((u) => u.role === "consultant").map((u) => (
            <option key={u._id || u.id} value={u._id || u.id}>{u.name || u.username}</option>
          ))}
        </select>
        {err("consultantId") && <p className="text-xs text-red-400">Vui lòng chọn tư vấn viên</p>}
      </div>

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {saving ? "Đang lưu..." : "Lưu lịch"}
        </button>
      </div>
    </div>
  );
}
