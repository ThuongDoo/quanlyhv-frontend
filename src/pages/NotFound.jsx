import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans px-4">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-10 max-w-sm w-full flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 mb-1">Trang không tồn tại</h1>
          <p className="text-sm text-slate-500">Đường dẫn bạn truy cập không hợp lệ hoặc đã bị xóa.</p>
        </div>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 transition"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
