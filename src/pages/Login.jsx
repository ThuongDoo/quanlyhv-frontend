import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/auth";
import { setToken, setUser } from "../hooks/useAuth";

export default function Login() {
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        {view === "login" && <LoginForm onForgot={() => setView("forgot")} navigate={navigate} />}
        {view === "forgot" && <ForgotForm onBack={() => setView("login")} onSent={() => setView("reset")} />}
        {view === "reset" && <ResetForm onBack={() => setView("forgot")} onDone={() => setView("login")} />}
      </div>
    </div>
  );
}

function LoginForm({ onForgot, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login({ email, password });
      if (data.token) setToken(data.token);
      if (data.user) setUser(data.user);
      navigate("/students", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập hệ thống</h1>
      <p className="text-sm text-slate-500 mb-6">Nhập email và mật khẩu để tiếp tục.</p>
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="a@example.com" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Mật khẩu
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="••••••••" />
        </label>
        <div className="flex justify-end">
          <button type="button" onClick={onForgot} className="text-xs text-indigo-500 hover:underline">
            Quên mật khẩu?
          </button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </>
  );
}

function ForgotForm({ onBack, onSent }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await authApi.forgotPassword(email);
      setSuccess("Đã gửi mã đặt lại mật khẩu về email của bạn.");
    } catch (err) {
      setError(err?.response?.data?.error || "Gửi thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={onBack} className="mb-4 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
        ← Quay lại đăng nhập
      </button>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Quên mật khẩu</h1>
      <p className="text-sm text-slate-500 mb-6">Nhập email tài khoản, chúng tôi sẽ gửi mã đặt lại về email.</p>
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="a@example.com" />
        </label>
        <button type="submit" disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Đang gửi..." : "Gửi mã đặt lại"}
        </button>
        {success && (
          <button type="button" onClick={onSent}
            className="w-full rounded-2xl border border-indigo-300 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
            Tôi đã nhận được mã →
          </button>
        )}
      </form>
    </>
  );
}

function ResetForm({ onBack, onDone }) {
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ resetToken, newPassword });
      onDone();
    } catch (err) {
      setError(err?.response?.data?.error || "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={onBack} className="mb-4 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
        ← Quay lại
      </button>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Đặt lại mật khẩu</h1>
      <p className="text-sm text-slate-500 mb-6">Nhập mã từ email và mật khẩu mới.</p>
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Mã đặt lại
          <input type="text" value={resetToken} onChange={(e) => setResetToken(e.target.value)} required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="Dán mã từ email vào đây" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Mật khẩu mới
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="••••••••" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Xác nhận mật khẩu
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="••••••••" />
        </label>
        <button type="submit" disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </button>
      </form>
    </>
  );
}
