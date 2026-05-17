import DateInput from "./DateInput";

export default function ScheduleForm({ date, hour, minute, consultantId, users, onDateChange, onHourChange, onMinuteChange, onConsultantChange, onSave, onCancel, saving }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Ngày hẹn</label>
        <DateInput
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-xl"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Giờ hẹn</label>
        <div className="flex items-center gap-2">
          <select
            value={hour}
            onChange={(e) => onHourChange(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Tư vấn viên</label>
        <select
          value={consultantId}
          onChange={(e) => onConsultantChange(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
        >
          <option value="">-- Chọn --</option>
          {users.filter((u) => u.role === "consultant").map((u) => (
            <option key={u._id || u.id} value={u._id || u.id}>{u.name || u.username}</option>
          ))}
        </select>
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
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {saving ? "Đang lưu..." : "Lưu lịch"}
        </button>
      </div>
    </div>
  );
}
