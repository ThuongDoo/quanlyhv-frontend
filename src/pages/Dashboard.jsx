import { useState } from "react";

const students = [
  {
    id: 1348,
    name: "Nguyễn Thị Hồng Ngọc",
    phone: "933212846",
    status: "ONL",
    type: 1,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: "14h 27/04/2026",
    csCount: 4,
  },
  {
    id: 1347,
    name: "Hoàng Công Vinh",
    phone: "767168013",
    status: "ONL",
    type: 2,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: null,
    csCount: 0,
  },
  {
    id: 1346,
    name: "Nguyễn Quang Tài",
    phone: "708525581",
    status: "ONL",
    type: 1,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: null,
    csCount: 0,
  },
  {
    id: 1345,
    name: "Ngô Trung Hiệu",
    phone: "936243267",
    status: "ONL",
    type: 2,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: null,
    csCount: 0,
  },
  {
    id: 1344,
    name: "Nguyễn Khánh Tường Vi",
    phone: "763701810",
    status: "ONL",
    type: 3,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: null,
    csCount: 0,
  },
  {
    id: 1343,
    name: "Nguyễn Hồ Đông Hưng",
    phone: "776734756",
    status: "ONL",
    type: 1,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: "09h 28/04/2026",
    csCount: 2,
  },
  {
    id: 1342,
    name: "Trần Minh Khoa",
    phone: "912345678",
    status: "ONL",
    type: 2,
    tuVanVien: "Nguyễn A",
    truongHoc: "THPT Lê Quý Đôn",
    lichHen: "10h 30/04/2026",
    csCount: 1,
  },
  {
    id: 1341,
    name: "Lê Thị Thu Hà",
    phone: "987654321",
    status: "ONL",
    type: 3,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: null,
    csCount: 0,
  },
  {
    id: 1340,
    name: "Phạm Văn Đức",
    phone: "901234567",
    status: "ONL",
    type: 1,
    tuVanVien: "Chưa chia",
    truongHoc: "Chưa cập nhật",
    lichHen: "15h 01/05/2026",
    csCount: 3,
  },
];

const typeConfig = {
  1: {
    label: "LOẠI 1: ƯU TIÊN",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 border border-red-200",
  },
  2: {
    label: "LOẠI 2: ĐANG CÂN NHẮC",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  3: {
    label: "LOẠI 3: KHÓ",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
  },
};

function StudentCard({ student }) {
  const cfg = typeConfig[student.type];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-[15px] leading-tight">
            {student.name}
          </h3>
          <a
            href={`tel:${student.phone}`}
            className="text-blue-500 font-semibold text-sm mt-0.5 block hover:underline"
          >
            {student.phone}
          </a>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="bg-teal-400 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
            {student.status}
          </span>
          <span className="text-slate-400 text-xs">#{student.id}</span>
        </div>
      </div>

      {/* Type badge */}
      <div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1 align-middle`}
          ></span>
          {cfg.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
        <div>
          <div className="uppercase tracking-wider font-semibold text-[10px] mb-0.5">
            Tư Vấn Viên
          </div>
          <div className="text-slate-700 font-medium">{student.tuVanVien}</div>
        </div>
        <div>
          <div className="uppercase tracking-wider font-semibold text-[10px] mb-0.5">
            Trường Học
          </div>
          <div className="text-slate-700 font-medium">{student.truongHoc}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-base">📅</span>
          {student.lichHen ? (
            <span className="text-slate-700 font-medium">
              {student.lichHen}
            </span>
          ) : (
            <span className="text-red-400 font-semibold">Chưa có lịch</span>
          )}
        </div>
        <div className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
          CS: {student.csCount} lần
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [showHidden, setShowHidden] = useState(false);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search),
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
            Matrix View: Ma Trận Ưu Tiên CRM
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Đồng bộ lúc:{" "}
            <span className="text-blue-500 font-semibold">{timeStr}</span>
          </p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Tìm tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-56 transition"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Legend card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-slate-800 text-base mb-2">
              Ma Trận Tiềm Năng (Leader View)
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <span
                  key={key}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${cfg.badge}`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="flex items-center gap-2 bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-slate-700 transition"
          >
            <span>🚗</span>
            Đang Ẩn Đã Đến/Từ chối
          </button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center text-slate-400 py-20 text-sm">
            Không tìm thấy học sinh nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
