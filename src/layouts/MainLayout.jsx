import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { Outlet } from "react-router-dom";
import { clearToken, getUser } from "../hooks/useAuth";
import { authApi } from "../services/auth";

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess("Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(err?.response?.data?.error || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="font-extrabold text-slate-800 text-base">Đổi mật khẩu</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {[
            { label: "Mật khẩu hiện tại", field: "currentPassword" },
            { label: "Mật khẩu mới", field: "newPassword" },
            { label: "Xác nhận mật khẩu mới", field: "confirm" },
          ].map(({ label, field }) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
              <input
                type="password"
                value={form[field]}
                onChange={set(field)}
                required
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          ))}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}
          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
              Đóng
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();
  const user = getUser();
  const [showChangePw, setShowChangePw] = useState(false);

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-slate-900 font-bold text-lg">QuanLyHocVien Dashboard</h2>
            <p className="text-sm text-slate-500">Quản lý học viên, import Excel, phân quyền và CRM.</p>
          </div>
          <div className="flex items-center gap-3">
            {user?.name && (
              <div className={`rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1.5 ${
                user.role === "admin" ? "bg-red-100 text-red-700" :
                user.role === "sale" ? "bg-amber-100 text-amber-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {user.name}
                <span className="opacity-40">•</span>
                <span className="font-bold text-xs uppercase">{user.role}</span>
              </div>
            )}
            <button
              onClick={() => setShowChangePw(true)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Đổi mật khẩu
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Đăng xuất
            </button>
          </div>
        </div>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  );
}
