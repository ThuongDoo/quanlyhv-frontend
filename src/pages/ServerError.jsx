const CONFIGS = {
  network: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 8.464a5 5 0 000 7.072M5.636 5.636a9 9 0 000 12.728" />
      </svg>
    ),
    bg: "bg-amber-100",
    title: "Mất kết nối internet",
    desc: "Vui lòng kiểm tra lại Wi-Fi hoặc mạng di động của bạn.",
  },
  server: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    bg: "bg-red-100",
    title: "Máy chủ không phản hồi",
    desc: "Máy chủ đang tạm dừng hoặc gặp sự cố. Vui lòng thử lại sau.",
  },
};

export default function ServerError({ type = "server", onRetry }) {
  const cfg = CONFIGS[type] ?? CONFIGS.server;
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans px-4">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-10 max-w-sm w-full flex flex-col items-center gap-6 text-center">
        <div className={`w-16 h-16 rounded-full ${cfg.bg} flex items-center justify-center`}>
          {cfg.icon}
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 mb-1">{cfg.title}</h1>
          <p className="text-sm text-slate-500">{cfg.desc}</p>
        </div>
        <button
          onClick={onRetry}
          className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 transition"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
