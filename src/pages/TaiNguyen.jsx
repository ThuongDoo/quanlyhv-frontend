import { useState, useEffect } from "react";
import { resourceApi, meetingMinutesApi } from "../services/resource";
import { useAuth } from "../hooks/useAuth";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function monthBadge(iso) {
  if (!iso) return null;
  return `THÁNG ${new Date(iso).getMonth() + 1}`;
}


// ── Modal thêm/sửa Resource ──────────────────────────────────────────────────
function ResourceModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({ name: initial?.name ?? "", link: initial?.link ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      isEdit ? await resourceApi.update(initial._id, form) : await resourceApi.create(form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || "Lưu thất bại.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="font-extrabold text-slate-800">{isEdit ? "Sửa tài nguyên" : "Thêm tài nguyên"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {[{ label: "Tên", field: "name" }, { label: "Link", field: "link" }].map(({ label, field }) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label} <span className="text-red-400">*</span></label>
              <input value={form[field]} onChange={set(field)} required
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
          ))}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Huỷ</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal thêm/sửa MeetingMinutes ────────────────────────────────────────────
function MeetingModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    content: initial?.content ?? "",
    date: initial?.date ? initial.date.split("T")[0] : "",
    note: initial?.note ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      isEdit ? await meetingMinutesApi.update(initial._id, form) : await meetingMinutesApi.create(form);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || "Lưu thất bại.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="font-extrabold text-slate-800">{isEdit ? "Sửa biên bản" : "Thêm biên bản"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ngày <span className="text-red-400">*</span></label>
            <input type="date" value={form.date} onChange={set("date")} required
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Nội dung <span className="text-red-400">*</span></label>
            <textarea value={form.content} onChange={set("content")} required rows={3}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-200 resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ghi chú</label>
            <textarea value={form.note} onChange={set("note")} rows={2} placeholder="Ghi chú thêm..."
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-200 resize-none" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Huỷ</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50">
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TaiNguyen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [resources, setResources] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [resourceModal, setResourceModal] = useState(null);
  const [meetingModal, setMeetingModal] = useState(null);

  const loadResources = () => resourceApi.getAll().then(setResources).catch(() => {});
  const loadMeetings = () => meetingMinutesApi.getAll().then(setMeetings).catch(() => {});

  useEffect(() => { loadResources(); loadMeetings(); }, []);

  const deleteResource = async (r) => {
    if (!window.confirm(`Xoá "${r.name}"?`)) return;
    await resourceApi.remove(r._id).catch(() => {});
    loadResources();
  };

  const deleteMeeting = async (m) => {
    if (!window.confirm("Xoá biên bản này?")) return;
    await meetingMinutesApi.remove(m._id).catch(() => {});
    loadMeetings();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm">
        <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">🔗 Tài nguyên & Link</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ── Tài nguyên ── */}
        <div className="rounded-2xl border-2 border-indigo-300 bg-white p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800 text-base">🔗 Tổng hợp Tài nguyên & Link nội bộ</h2>
            {isAdmin && (
              <button onClick={() => setResourceModal({ mode: "add" })}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 transition">
                + Thêm
              </button>
            )}
          </div>

          {resources.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Chưa có tài nguyên nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.map((r) => (
                <div key={r._id} className="group relative flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition">
                  <a href={r.link} target="_blank" rel="noreferrer"
                    className="font-bold text-indigo-700 text-sm uppercase tracking-wide hover:underline flex-1 truncate pr-3">
                    {r.name}
                  </a>
                  <div className="flex items-center gap-2 shrink-0">
                    {monthBadge(r.createdAt) && (
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 tracking-widest">
                        {monthBadge(r.createdAt)}
                      </span>
                    )}
                    {isAdmin && (
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={() => setResourceModal({ mode: "edit", data: r })}
                          className="rounded-lg bg-indigo-100 hover:bg-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-600">Sửa</button>
                        <button onClick={() => deleteResource(r)}
                          className="rounded-lg bg-red-100 hover:bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-500">Xoá</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Biên bản cuộc họp ── */}
        <div className="rounded-2xl border-2 border-amber-400 bg-white p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800 text-base">📋 Ghi chú từ Biên bản cuộc họp</h2>
            {isAdmin && (
              <button onClick={() => setMeetingModal({ mode: "add" })}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 transition">
                + Thêm
              </button>
            )}
          </div>

          {meetings.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Chưa có biên bản nào.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {meetings.map((m) => {
                const expanded = expandedId === m._id;
                return (
                  <div key={m._id}
                    className={`group rounded-xl border transition-all ${expanded ? "bg-amber-50 border-amber-300" : "bg-white border-slate-200 hover:border-amber-200"}`}
                  >
                    {/* Header — luôn hiển thị, bấm để toggle */}
                    <div
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none"
                      onClick={() => setExpandedId(expanded ? null : m._id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest shrink-0">
                          {fmtDate(m.date)}
                        </span>
                        {!expanded && (
                          <span className="text-sm text-slate-500 truncate">{m.content}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {isAdmin && (
                          <div className="hidden group-hover:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setMeetingModal({ mode: "edit", data: m })}
                              className="rounded-lg bg-amber-100 hover:bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">Sửa</button>
                            <button onClick={() => deleteMeeting(m)}
                              className="rounded-lg bg-red-100 hover:bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-500">Xoá</button>
                          </div>
                        )}
                        <span className={`text-slate-400 text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
                      </div>
                    </div>

                    {/* Chi tiết — chỉ hiện khi expanded */}
                    {expanded && (
                      <div className="px-4 pb-4 flex flex-col gap-2 border-t border-amber-200 pt-3">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.content}</p>
                        {m.note && (
                          <div className="rounded-lg bg-white border border-amber-200 px-3 py-2">
                            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1">Ghi chú</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{m.note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {resourceModal && (
        <ResourceModal
          initial={resourceModal.mode === "edit" ? resourceModal.data : null}
          onClose={() => setResourceModal(null)}
          onSaved={() => { setResourceModal(null); loadResources(); }}
        />
      )}
      {meetingModal && (
        <MeetingModal
          initial={meetingModal.mode === "edit" ? meetingModal.data : null}
          onClose={() => setMeetingModal(null)}
          onSaved={() => { setMeetingModal(null); loadMeetings(); }}
        />
      )}
    </div>
  );
}
