import { useState, useEffect } from "react";
import { penaltyApi } from "../services/nhanSu";
import { authApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { fmtDate } from "../utils/dateHelpers";

const TRANG_THAI = {
  chua_nop: { label: "Chưa nộp", cls: "border-amber-200 bg-amber-50 text-amber-600" },
  da_nop:   { label: "Đã nộp",   cls: "border-emerald-200 bg-emerald-50 text-emerald-600" },
};

import { fmtDate } from "../utils/dateHelpers";

function AddPenaltyModal({ users, onClose, onSaved }) {
  const [form, setForm] = useState({ userId: "", date: "", loiPhat: "", tienPhat: 10000, trangThai: "chua_nop" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await penaltyApi.create({ ...form, tienPhat: Number(form.tienPhat) });
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || "Lưu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="font-extrabold text-slate-800 text-base">Thêm lỗi phạt</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Nhân viên <span className="text-red-400">*</span></label>
            <select value={form.userId} onChange={set("userId")} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200">
              <option value="">-- Chọn --</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Ngày <span className="text-red-400">*</span></label>
            <input type="date" value={form.date} onChange={set("date")} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Lý do lỗi <span className="text-red-400">*</span></label>
            <input type="text" value={form.loiPhat} onChange={set("loiPhat")} required className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Tiền phạt (VNĐ)</label>
            <input type="number" min={0} value={form.tienPhat} onChange={set("tienPhat")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Huỷ</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50">{loading ? "Đang lưu..." : "Lưu"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QuyHocTap() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () =>
    penaltyApi.getAll({ limit: 100 })
      .then((res) => setList(res.penalties ?? []))
      .catch(() => {});

  useEffect(() => {
    load();
    if (isAdmin) {
      authApi.fetchUsers()
        .then((data) => setUsers(Array.isArray(data) ? data : data.users ?? []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleTrangThaiChange = (id, value) =>
    setList((prev) => prev.map((r) => r._id === id ? { ...r, trangThai: value } : r));

  const handleSave = async (row) => {
    setSavingId(row._id);
    try {
      await penaltyApi.updateTrangThai(row._id, row.trangThai);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Xoá lỗi phạt của "${row.userId?.name}"?`)) return;
    try {
      await penaltyApi.remove(row._id);
      load();
    } catch {
      alert("Xoá thất bại.");
    }
  };

  const chuaNop = list.filter((r) => r.trangThai === "chua_nop").length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">🏦 Quỹ Học Tập</h1>
        <div className="flex items-center gap-3">
          {chuaNop > 0 && (
            <span className="rounded-lg bg-red-500 text-white text-xs font-bold px-3 py-1.5">
              {chuaNop} Chưa nộp
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 transition"
            >
              + Thêm lỗi
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-700">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50">
                  <th className="px-4 py-3 text-left text-red-400">Họ Tên</th>
                  <th className="px-3 py-3 text-center text-red-400">Ngày</th>
                  <th className="px-3 py-3 text-left text-red-400">Lý do lỗi</th>
                  <th className="px-3 py-3 text-center text-red-400">Phạt (VNĐ)</th>
                  <th className="px-3 py-3 text-center text-red-400">Trạng thái</th>
                  {isAdmin && <th className="px-3 py-3 text-center text-red-400">Lưu</th>}
                  {isAdmin && <th className="px-3 py-3 text-center text-red-400">Xoá</th>}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 5} className="text-center text-slate-400 py-10 text-xs">Chưa có dữ liệu.</td>
                  </tr>
                ) : list.map((row) => (
                  <tr key={row._id} className="border-t border-slate-100 hover:bg-red-50/30 transition">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{row.userId?.name ?? "—"}</td>
                    <td className="px-3 py-2.5 text-center text-slate-500 text-xs">{fmtDate(row.date)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.loiPhat}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-red-500">
                      {(row.tienPhat ?? 0).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {isAdmin ? (
                        <select
                          value={row.trangThai}
                          onChange={(e) => handleTrangThaiChange(row._id, e.target.value)}
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-red-200 ${TRANG_THAI[row.trangThai]?.cls}`}
                        >
                          {Object.entries(TRANG_THAI).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${TRANG_THAI[row.trangThai]?.cls}`}>
                          {TRANG_THAI[row.trangThai]?.label ?? row.trangThai}
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => handleSave(row)}
                          disabled={savingId === row._id}
                          className="rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition disabled:opacity-50"
                        >
                          {savingId === row._id ? "..." : "Lưu"}
                        </button>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => handleDelete(row)}
                          className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1 text-xs font-semibold text-red-500 transition"
                        >
                          Xoá
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <AddPenaltyModal
          users={users}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
