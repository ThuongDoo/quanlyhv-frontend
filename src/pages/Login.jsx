import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/auth";
import { setToken, setUser } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authApi.login({ email, password });
      if (data.token) {
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      navigate("/students", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Đăng nhập thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Đăng nhập hệ thống
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Nhập email và mật khẩu để tiếp tục. Hệ thống sẽ sử dụng JWT token cho
          mỗi request.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="a@example.com"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-500">
          Bạn chưa có tài khoản? Vui lòng liên hệ admin để đăng ký hoặc sử dụng
          API /auth/register.
        </div>
      </div>
    </div>
  );
}
