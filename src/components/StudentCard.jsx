import { useState } from "react";
import { classificationConfig, statusConfig } from "../constants/studentConfig";
import { studentApi } from "../services/students";

function formatScheduledAt(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", hour12: false });
}

export default function StudentCard({ student, users = [] }) {
  const [insightOpen, setInsightOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localInsight, setLocalInsight] = useState(undefined);

  const typeCfg = classificationConfig[student.clasification ?? "0"];
  const statusCfg = statusConfig[student.status] || Object.values(statusConfig)[0];

  const rawInsight = Array.isArray(student.insights) ? student.insights[0] : student.insights;
  const insight = localInsight !== undefined ? localInsight : rawInsight;

  const ownerUser = users.find((u) => (u._id || u.id) === student.ownerUserId);
  const saleName = ownerUser?.name || ownerUser?.username || "Chưa chia";

  const consultantId = student.consultant?._id || student.consultant?.id || student.consultant;
  const consultantUser = users.find((u) => (u._id || u.id) === consultantId);
  const consultantName = consultantUser?.name || consultantUser?.username || "Chưa có";

  const scheduledStr = formatScheduledAt(student.scheduledAt);

  const openEdit = () => {
    setDraft(insight || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const newInsight = draft.trim();
    setLocalInsight(newInsight || null);
    setEditing(false);
    setInsightOpen(false);
    try {
      await studentApi.updateStudent(student._id || student.id, { insights: newInsight ? [newInsight] : [] });
    } catch {
      setLocalInsight(rawInsight);
    } finally {
      setSaving(false);
    }
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
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.className}`}>{statusCfg.label}</span>
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
            <button
              onClick={() => { setInsightOpen(true); setEditing(false); }}
              className="w-full text-left bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-800 leading-relaxed truncate hover:bg-amber-100 transition"
            >
              💬 {insight}
            </button>
          ) : (
            <button
              onClick={openEdit}
              className="w-full text-left border border-dashed border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400 hover:border-amber-300 hover:text-amber-500 transition"
            >
              + Thêm ghi chú...
            </button>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-sm">
              <span>📅</span>
              {scheduledStr ? (
                <span className="font-bold text-indigo-600">{scheduledStr}</span>
              ) : (
                <span className="text-slate-400 font-medium text-xs">Chưa có lịch hẹn</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insight modal */}
      {insightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setInsightOpen(false); setEditing(false); }}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{student.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{student.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <button onClick={handleCopy} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${copied ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"}`}>
                    {copied ? "Đã copy!" : "Copy"}
                  </button>
                )}
                <button onClick={openEdit} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition">
                  Sửa
                </button>
              </div>
            </div>

            {editing ? (
              <>
                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                  placeholder="Nhập ghi chú..."
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setEditing(false)} className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                    Huỷ
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 transition">
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">
                  {insight}
                </div>
                <button onClick={() => { setInsightOpen(false); setEditing(false); }} className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Đóng
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
