import { useState } from "react";

const MOCK_DATA = Array.from({ length: 54 * 7 }, (_, i) => {
  const names = [
    "Nguyễn Thị Hồng Ngọc",
    "Hoàng Công Vinh",
    "Nguyễn Quang Tài",
    "Ngô Trung Hiệu",
    "Nguyễn Khánh Tường Vi",
    "Nguyễn Hồ Đông Hưng",
    "Bàn Thị Nhật Lệ",
    "Trần Minh Khoa",
    "Lê Thị Thu Hà",
    "Phạm Văn Đức",
  ];
  const phones = [
    "933212846",
    "767168013",
    "708525581",
    "936243267",
    "763701810",
    "776734756",
    "387039882",
    "912345678",
    "987654321",
    "901234567",
  ];
  const loai = ["Loại 1", "Loại 2", "Loại 3"];
  const lamAm = ["nhiệt tình", "quan tâm", "do dự", "lạnh nhạt", ""];
  const ngayHen = ["14h 27/04/2026", "09h 28/04/2026", "10h 01/05/2026", ""];
  const da = ["Ch", "Đã", ""];

  const idx = i % names.length;
  return {
    id: 1348 - i,
    hoTen: names[idx],
    sdt: phones[idx],
    phanLoai: loai[i % 3],
    truong: i % 5 === 0 ? "THPT Lê Quý Đôn" : "",
    saleMoi: i % 7 === 0 ? "Nguyễn A" : "",
    lamAm: lamAm[i % lamAm.length],
    lienHe1: i % 4 === 0 ? "Đã gọi" : "",
    lienHe2: i % 8 === 0 ? "Zalo" : "",
    ngayHen: ngayHen[i % ngayHen.length],
    da: da[i % da.length],
  };
});

const PAGE_SIZE = 7;

const loaiConfig = {
  "Loại 1": "bg-red-100 text-red-700 border-red-200",
  "Loại 2": "bg-amber-100 text-amber-700 border-amber-200",
  "Loại 3": "bg-slate-100 text-slate-600 border-slate-200",
};

export default function Students() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_DATA.filter(
    (s) =>
      s.hoTen.toLowerCase().includes(search.toLowerCase()) ||
      s.sdt.includes(search),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
            CRM: Khách Hàng Tiềm Năng
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
            onChange={handleSearch}
            className="pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-56 transition"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-slate-800 text-base">
                Danh sách Khách hàng
              </h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                {filtered.length} Leads
              </span>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
              + Thêm Mới
            </button>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    { label: "Họ Tên", cls: "text-slate-600" },
                    { label: "SĐT", cls: "text-slate-600" },
                    { label: "Phân Loại", cls: "text-slate-600" },
                    { label: "Trường", cls: "text-slate-600" },
                    { label: "Sale Mới", cls: "text-slate-600" },
                    { label: "Làm Ấm", cls: "text-amber-500 font-bold" },
                    { label: "Liên hệ Lần 1", cls: "text-teal-600 font-bold" },
                    { label: "Liên hệ Lần 2", cls: "text-teal-600 font-bold" },
                    {
                      label: "Ngày Giờ Hẹn Đến",
                      cls: "text-red-500 font-bold",
                    },
                    { label: "Đã", cls: "text-slate-600" },
                    { label: "Sửa", cls: "text-slate-600" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide whitespace-nowrap ${col.cls}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="text-center text-slate-400 py-12"
                    >
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                ) : (
                  paginated.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-b border-slate-50 hover:bg-indigo-50/40 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      {/* Họ Tên */}
                      <td className="px-4 py-3 font-bold text-indigo-700 whitespace-nowrap">
                        {s.hoTen}
                      </td>
                      {/* SĐT */}
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${s.sdt}`}
                          className="text-blue-500 hover:underline font-medium"
                        >
                          {s.sdt}
                        </a>
                      </td>
                      {/* Phân Loại */}
                      <td className="px-4 py-3">
                        {s.phanLoai && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${loaiConfig[s.phanLoai]}`}
                          >
                            {s.phanLoai}
                          </span>
                        )}
                      </td>
                      {/* Trường */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {s.truong}
                      </td>
                      {/* Sale Mới */}
                      <td className="px-4 py-3 text-slate-600">{s.saleMoi}</td>
                      {/* Làm Ấm */}
                      <td className="px-4 py-3 text-amber-600 font-medium">
                        {s.lamAm}
                      </td>
                      {/* Liên hệ 1 */}
                      <td className="px-4 py-3 text-teal-600 font-medium">
                        {s.lienHe1}
                      </td>
                      {/* Liên hệ 2 */}
                      <td className="px-4 py-3 text-teal-600 font-medium">
                        {s.lienHe2}
                      </td>
                      {/* Ngày Hẹn */}
                      <td className="px-4 py-3 font-bold text-red-500 whitespace-nowrap">
                        {s.ngayHen}
                      </td>
                      {/* Đã */}
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {s.da}
                      </td>
                      {/* Sửa */}
                      <td className="px-4 py-3">
                        <button
                          className="text-lg hover:scale-110 transition-transform"
                          title="Sửa"
                        >
                          📝
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Trang <span className="font-bold text-slate-700">{page}</span> /{" "}
              {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-1.5 rounded-lg border border-indigo-300 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
