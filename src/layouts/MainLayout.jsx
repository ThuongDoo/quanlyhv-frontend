import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import { Outlet } from "react-router-dom";
import { clearToken, getUser } from "../hooks/useAuth";

export default function MainLayout() {
  const navigate = useNavigate();
  const user = getUser();

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
            <h2 className="text-slate-900 font-bold text-lg">
              QuanLyHocVien Dashboard
            </h2>
            <p className="text-sm text-slate-500">
              Quản lý học viên, import Excel, phân quyền và CRM.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.name && (
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {user.name} • {user.role}
              </div>
            )}
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
    </div>
  );
}
