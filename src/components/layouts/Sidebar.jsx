import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MENU } from "../../constants/menu";
import { clearToken, getUser } from "../../hooks/useAuth";
import { authApi } from "../../services/auth";
import { ROLE_LABELS } from "../../constants/studentConfig";

function ResultModal({ type, text, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl flex flex-col items-center gap-4">
        {type === "success" ? (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <p className="text-base font-bold text-slate-800 text-center">{text}</p>
        <button
          type="button"
          onClick={onClose}
          className={`w-full rounded-2xl py-3 text-sm font-bold text-white transition ${type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setResult({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setResult({ type: "success", text: "Đổi mật khẩu thành công!" });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setResult({ type: "error", text: err.message || "Đổi mật khẩu thất bại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Đóng</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {result && (
        <ResultModal
          type={result.type}
          text={result.text}
          onClose={() => { setResult(null); if (result.type === "success") onClose(); }}
        />
      )}
    </>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();
  const [showChangePw, setShowChangePw] = useState(false);

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  const roleColor =
    user?.role === "admin" ? "bg-red-100 text-red-700" :
    user?.role === "sale" ? "bg-amber-100 text-amber-700" :
    "bg-blue-100 text-blue-700";

  return (
    <>
      <div className="w-64 h-screen bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="font-bold text-base text-slate-800">🔥 TEAM 102</div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-2">
          {MENU.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-sm transition ${isActive ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User info + actions */}
        <div className="border-t border-slate-100 p-3 flex flex-col gap-2">
          {user?.name && (
            <div className={`rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 ${roleColor}`}>
              <span className="font-semibold truncate">{user.name}</span>
              <span className="opacity-40">•</span>
              <span className="font-bold shrink-0">{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
          )}
          <button
            onClick={() => setShowChangePw(true)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition text-left"
          >
            🔑 Đổi mật khẩu
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition text-left"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </>
  );
}
