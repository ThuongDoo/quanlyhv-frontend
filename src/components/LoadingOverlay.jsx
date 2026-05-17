export default function LoadingOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Đang tải...</span>
      </div>
    </div>
  );
}
