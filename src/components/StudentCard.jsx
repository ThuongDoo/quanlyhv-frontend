import { useState, useRef, useEffect } from "react";
import { classificationConfig, statusConfig } from "../constants/studentConfig";
import { studentApi } from "../services/students";
import ConfirmModal from "./ConfirmModal";
import ScheduleForm from "./ScheduleForm";
import { fmtDate, fmtDateTime } from "../utils/dateHelpers";
import { appointmentApi } from "../services/appointments";

function formatScheduledAt(raw) {
  return raw ? fmtDateTime(raw) : null;
}

export default function StudentCard({ student, users = [], appointmentId }) {
  const useAppointmentApi = Boolean(appointmentId);
  // Insight
  const [insightOpen, setInsightOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState(false);
  const [insightDraft, setInsightDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [localInsight, setLocalInsight] = useState(undefined);

  // Status
  const [localStatus, setLocalStatus] = useState(undefined);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef(null);

  // Schedule
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedDate, setSchedDate] = useState("");
  const [schedHour, setSchedHour] = useState("");
  const [schedMinute, setSchedMinute] = useState("00");
  const [schedConsultantId, setSchedConsultantId] = useState("");
  const [localScheduledAt, setLocalScheduledAt] = useState(undefined);

  // Closing call date
  const [closingOpen, setClosingOpen] = useState(false);
  const [closingDate, setClosingDate] = useState("");
  const [localClosingCallDate, setLocalClosingCallDate] = useState(undefined);

  const [localConsultantId, setLocalConsultantId] = useState(undefined);

  // Confirm modal
  const [pending, setPending] = useState(null); // { label, description, onConfirm }

  useEffect(() => {
    if (!statusOpen) return;
    const h = (e) => { if (!statusRef.current?.contains(e.target)) setStatusOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [statusOpen]);


  const typeCfg = classificationConfig[student.clasification || ""] ?? classificationConfig[""];
  const currentStatus = localStatus !== undefined ? localStatus : student.status;
  const statusCfg = statusConfig[currentStatus] || Object.values(statusConfig)[0];

  const rawInsight = Array.isArray(student.insights) ? student.insights[0] : student.insights;
  const insight = localInsight !== undefined ? localInsight : rawInsight;

  const scheduledAt = localScheduledAt !== undefined ? localScheduledAt : student.scheduledAt;
  const scheduledStr = formatScheduledAt(scheduledAt);

  const closingCallDate = localClosingCallDate !== undefined ? localClosingCallDate : student.closingCallDate;
  const closingStr = closingCallDate ? fmtDate(closingCallDate) : null;

  const ownerUser = users.find((u) => (u._id || u.id) === student.ownerUserId);
  const saleName = ownerUser?.name || "Chưa chia";

  const resolvedConsultantId = localConsultantId !== undefined ? localConsultantId
    : student.consultant?._id || student.consultant?.id || (typeof student.consultant === "string" ? student.consultant : null);
  const consultantUser = users.find((u) => (u._id || u.id) === resolvedConsultantId);
  const consultantName = consultantUser?.name || "Chưa có";

  const confirm = (label, description, onConfirm) => setPending({ label, description, onConfirm });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const applyStatusChange = (newStatus) => {
    setStatusOpen(false);
    const label = statusConfig[newStatus]?.label;
    confirm(
      "Đổi trạng thái",
      `Chuyển sang "${label}"?`,
      async () => {
        setLocalStatus(newStatus);
        try {
          if (useAppointmentApi) await appointmentApi.update(appointmentId, { status: newStatus });
          else await studentApi.updateStudent(student._id || student.id, { status: newStatus });
        } catch { setLocalStatus(student.status); }
      }
    );
  };

  const openSchedule = () => {
    const raw = scheduledAt ? new Date(scheduledAt) : null;
    setSchedDate(raw ? raw.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setSchedHour(raw ? String(raw.getHours()).padStart(2, "0") : "");
    setSchedMinute(raw ? String(Math.round(raw.getMinutes() / 15) * 15).padStart(2, "0") : "00");
    setSchedConsultantId(resolvedConsultantId || "");
    setScheduleOpen(true);
  };

  const applySchedule = () => {
    const newScheduledAt = schedDate ? `${schedDate}T${schedHour || "00"}:${schedMinute}` : null;
    const display = newScheduledAt ? formatScheduledAt(newScheduledAt) : "Xoá lịch hẹn";
    confirm(
      "Cập nhật lịch hẹn",
      `Đặt lịch: ${display}?`,
      async () => {
        setLocalScheduledAt(newScheduledAt);
        setLocalConsultantId(schedConsultantId || null);
        setScheduleOpen(false);
        try {
          if (useAppointmentApi) {
            const [aptDate, aptTime] = newScheduledAt ? newScheduledAt.split("T") : [null, null];
            await appointmentApi.update(appointmentId, { appointmentDate: aptDate, appointmentTime: aptTime, consultantId: schedConsultantId });
          } else {
            await studentApi.scheduleStudent(student._id || student.id, { consultantId: schedConsultantId, scheduledAt: newScheduledAt });
          }
        } catch { setLocalScheduledAt(scheduledAt); setLocalConsultantId(resolvedConsultantId); }
      }
    );
    setScheduleOpen(false);
  };

  const openClosing = () => {
    setClosingDate(closingCallDate
      ? new Date(closingCallDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
    );
    setClosingOpen(true);
  };

  const applyClosingDate = () => {
    const val = closingDate || null;
    const display = val ? fmtDate(val) : "Xoá ngày liên hệ";
    confirm(
      "Cập nhật ngày liên hệ",
      `Đặt ngày liên hệ: ${display}?`,
      async () => {
        setLocalClosingCallDate(val);
        setClosingOpen(false);
        try {
          if (useAppointmentApi) await appointmentApi.update(appointmentId, { closingCallDate: val });
          else await studentApi.updateStudent(student._id || student.id, { closingCallDate: val });
        } catch { setLocalClosingCallDate(student.closingCallDate); }
      }
    );
    setClosingOpen(false);
  };

  const applyInsight = async () => {
    const val = insightDraft.trim() || null;
    confirm(
      "Lưu ghi chú",
      val ? `"${val.slice(0, 60)}${val.length > 60 ? "..." : ""}"` : "Xoá ghi chú?",
      async () => {
        setLocalInsight(val);
        setEditingInsight(false);
        setInsightOpen(false);
        try { await studentApi.updateStudent(student._id || student.id, { insights: val ? [val] : [] }); }
        catch { setLocalInsight(rawInsight); }
      }
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(insight || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
        {typeCfg && (
          <div className={`h-1 w-full ${typeCfg.className.includes("red") ? "bg-red-400" : typeCfg.className.includes("amber") ? "bg-amber-400" : typeCfg.className.includes("blue") ? "bg-blue-400" : "bg-slate-300"}`} />
        )}

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-[15px] leading-snug truncate">{student.name}</h3>
              <a href={`tel:${student.phone}`} className="text-blue-500 font-semibold text-sm mt-0.5 inline-block hover:underline">
                {student.phone}
              </a>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {/* Status dropdown */}
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setStatusOpen((v) => !v)}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition ${statusCfg.className}`}
                >
                  {statusCfg.label} ▾
                </button>
                {statusOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[120px]">
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <button key={key} onClick={() => applyStatusChange(key)}
                        className={`w-full text-left px-3 py-2 text-[11px] font-bold transition hover:opacity-90 ${cfg.className} ${key === currentStatus ? "opacity-100" : "opacity-60"}`}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {typeCfg && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeCfg.className}`}>{typeCfg.label}</span>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="uppercase tracking-wider font-semibold text-[10px] text-slate-400 mb-0.5">Sale</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{saleName}</p>
            </div>
            <div>
              <p className="uppercase tracking-wider font-semibold text-[10px] text-slate-400 mb-0.5">Tư vấn viên</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{consultantName}</p>
            </div>
          </div>

          {/* Insight */}
          {insight ? (
            <button onClick={() => { setInsightOpen(true); setEditingInsight(false); }}
              className="w-full text-left bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-800 leading-relaxed truncate hover:bg-amber-100 transition">
              💬 {insight}
            </button>
          ) : (
            <button onClick={() => { setInsightDraft(""); setEditingInsight(true); setInsightOpen(true); }}
              className="w-full text-left border border-dashed border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400 hover:border-amber-300 hover:text-amber-500 transition">
              + Thêm ghi chú...
            </button>
          )}

          {/* Footer — 2 dates */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            <button onClick={openSchedule}
              className={`flex flex-col items-start gap-0.5 rounded-xl px-3 py-2 transition hover:opacity-80 ${scheduledStr ? "bg-indigo-50 border border-indigo-200" : "border border-dashed border-slate-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">📅 Lịch hẹn</span>
              {scheduledStr ? (
                <span className="text-xs font-bold text-indigo-700">{scheduledStr}</span>
              ) : (
                <span className="text-[11px] text-slate-400">Chưa có</span>
              )}
            </button>
            <button onClick={openClosing}
              className={`flex flex-col items-start gap-0.5 rounded-xl px-3 py-2 transition hover:opacity-80 ${closingStr ? "bg-rose-50 border border-rose-200" : "border border-dashed border-slate-200"}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">📞 Ngày liên hệ</span>
              {closingStr ? (
                <span className="text-xs font-bold text-rose-600">{closingStr}</span>
              ) : (
                <span className="text-[11px] text-slate-400">Chưa có</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule popup */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setScheduleOpen(false)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-4">Đặt lịch hẹn</h3>
            <ScheduleForm
              date={schedDate}
              hour={schedHour}
              minute={schedMinute}
              consultantId={schedConsultantId}
              users={users}
              onDateChange={setSchedDate}
              onHourChange={setSchedHour}
              onMinuteChange={setSchedMinute}
              onConsultantChange={setSchedConsultantId}
              onSave={applySchedule}
              onCancel={() => setScheduleOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Insight modal */}
      {insightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => { setInsightOpen(false); setEditingInsight(false); }}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{student.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{student.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                {!editingInsight && insight && (
                  <button onClick={handleCopy}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${copied ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"}`}>
                    {copied ? "Đã copy!" : "Copy"}
                  </button>
                )}
                {!editingInsight && (
                  <button onClick={() => { setInsightDraft(insight || ""); setEditingInsight(true); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition">
                    Sửa
                  </button>
                )}
              </div>
            </div>

            {editingInsight ? (
              <>
                <textarea autoFocus value={insightDraft} onChange={(e) => setInsightDraft(e.target.value)} rows={5}
                  className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                  placeholder="Nhập ghi chú..." />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setEditingInsight(false)}
                    className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Huỷ</button>
                  <button onClick={applyInsight}
                    className="flex-1 rounded-2xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition">Lưu</button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{insight}</div>
                <button onClick={() => { setInsightOpen(false); }}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Đóng</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Closing call date popup */}
      {closingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setClosingOpen(false)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-slate-800">📞 Ngày liên hệ</h3>
            <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
            <div className="flex gap-2">
              <button onClick={() => setClosingOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">Huỷ</button>
              <button onClick={applyClosingDate}
                className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white hover:bg-rose-600 transition">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {pending && (
        <ConfirmModal
          title={pending.label}
          description={pending.description}
          onConfirm={() => { pending.onConfirm(); setPending(null); }}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
