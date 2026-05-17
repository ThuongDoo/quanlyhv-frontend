import { useState, useEffect } from "react";
import { authApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import ImportExcel from "../components/ImportExcel";
import { fmtDate } from "../utils/dateHelpers";

const ROLE_OPTIONS = ["sale", "consultant", "admin"];

const EMPTY_FORM = {
  name: "", phone: "", email: "", password: "",
  employeeId: "", dateOfBirth: "", joinDate: "", university: "", role: "sale",
};

function NhanSuModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(
    isEdit
      ? {
          name: initial.name ?? "",
          phone: initial.phone ?? "",
          email: initial.email ?? "",
          password: "",
          employeeId: initial.employeeId ?? "",
          dateOfBirth: initial.dateOfBirth ? initial.dateOfBirth.split("T")[0] : "",
          joinDate: initial.joinDate ? initial.joinDate.split("T")[0] : "",
          university: initial.university ?? "",
          role: initial.role ?? "sale",
        }
      : { ...EMPTY_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await authApi.updateUser(initial._id, payload);
      } else {
        await authApi.register(form);
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || "Lưu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Họ tên", field: "name", required: !isEdit },
    { label: "SĐT", field: "phone", required: !isEdit },
    { label: "Email", field: "email", type: "email", required: !isEdit },
    { label: isEdit ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu", field: "password", type: "password", required: !isEdit },
    { label: "Mã nhân viên", field: "employeeId", required: !isEdit },
    { label: "Ngày sinh", field: "dateOfBirth", type: "date" },
    { label: "Ngày vào", field: "joinDate", type: "date" },
    { label: "Trường", field: "university" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-extrabold text-slate-800 text-base">
          {isEdit ? "Sửa Nhân sự" : "Thêm Nhân sự mới"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map(({ label, field, type = "text", required }) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
                required={required}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Vai trò</label>
            <select
              value={form.role}
              onChange={set("role")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
              Huỷ
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

export default function NhanSu() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [nhanSuList, setNhanSuList] = useState([]);
  const [modal, setModal] = useState(null);

  const loadNhanSu = () =>
    authApi.fetchUsers()
      .then((data) => setNhanSuList(Array.isArray(data) ? data : data.users ?? []))
      .catch(() => {});

  useEffect(() => {
    loadNhanSu();
  }, []);

  const handleDelete = async (ns) => {
    if (!window.confirm(`Xoá nhân sự "${ns.name}"?`)) return;
    try {
      await authApi.deleteUser(ns._id);
      loadNhanSu();
    } catch {
      alert("Xoá thất bại.");
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">🧑‍💻 Thông tin Nhân sự</h1>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <ImportExcel
              onImport={async (file) => { const res = await authApi.importUsers(file); loadNhanSu(); return res; }}
              defaultPassword="123456"
            />
            <button
              onClick={() => setModal({ mode: "add" })}
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 transition"
            >
              + Thêm NS Mới
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-700">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50">
                  <th className="px-4 py-3 text-left">Mã NV</th>
                  <th className="px-3 py-3 text-left">Họ Tên</th>
                  <th className="px-3 py-3 text-left">SĐT</th>
                  <th className="px-3 py-3 text-center">Ngày sinh</th>
                  <th className="px-3 py-3 text-center">Ngày vào</th>
                  <th className="px-3 py-3 text-left">Trường</th>
                  <th className="px-3 py-3 text-left">Email</th>
                  <th className="px-3 py-3 text-center">Chức vụ</th>
                  {isAdmin && <th className="px-3 py-3 text-center">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {nhanSuList.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} className="text-center text-slate-400 py-10 text-xs">
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                ) : nhanSuList.map((ns) => (
                  <tr key={ns._id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{ns.employeeId}</td>
                    <td className="px-3 py-3 font-bold text-slate-800">{ns.name}</td>
                    <td className="px-3 py-3 text-blue-500 font-semibold">{ns.phone}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{fmtDate(ns.dateOfBirth)}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{fmtDate(ns.joinDate)}</td>
                    <td className="px-3 py-3 text-slate-600">{ns.university ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{ns.email}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                        ns.role === "admin" ? "bg-red-100 text-red-600" :
                        ns.role === "consultant" ? "bg-indigo-100 text-indigo-600" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {ns.role}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setModal({ mode: "edit", data: ns })}
                            className="rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-600 transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(ns)}
                            className="rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-500 transition"
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <NhanSuModal
          initial={modal.mode === "edit" ? modal.data : null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); loadNhanSu(); }}
        />
      )}
    </div>
  );
}
