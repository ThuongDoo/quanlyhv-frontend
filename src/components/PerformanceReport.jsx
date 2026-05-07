export function PerformanceSummary({ s = {}, title }) {
  return (
    <div className="rounded-2xl border-2 border-indigo-300 bg-white p-5 flex flex-col gap-4">
      <h2 className="text-base font-extrabold text-indigo-700 tracking-widest">{title}</h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Nhắc máy", value: s.nhacMay, color: "text-amber-500" },
          { label: "Gọi ĐL", value: s.goiDatLich, color: "text-blue-600" },
          { label: "Lịch hẹn mới", value: s.lichMoi, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
            <span className={`text-2xl font-extrabold ${color}`}>{value ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Học viên DKĐ</span>
          <span className="text-3xl font-extrabold text-indigo-700">{s.lichMoi ?? 0}</span>
        </div>
        <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Học viên thực tế đến</span>
          <span className="text-3xl font-extrabold text-teal-600">{s.hvDen ?? 0}</span>
        </div>
      </div>

      <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Tổng doanh thu</span>
          <span className="text-xs text-red-300">DS: {(s.doanhSo ?? 0).toLocaleString("vi-VN")} đ</span>
        </div>
        <span className="text-3xl font-extrabold text-red-500">
          {(s.doanhThu ?? 0).toLocaleString("vi-VN")} đ
        </span>
      </div>
    </div>
  );
}

export function PerformanceTable({ rows = [], getLabel, tableTitle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {tableTitle && (
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-700 text-sm">{tableTitle}</h2>
        </div>
      )}
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-10">Chưa có dữ liệu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3 text-left">Kỳ</th>
                <th className="px-3 py-3 text-center">Đ.Danh</th>
                <th className="px-3 py-3 text-center">N.Máy</th>
                <th className="px-3 py-3 text-center">Gọi ĐL</th>
                <th className="px-3 py-3 text-center">Lịch mới</th>
                <th className="px-3 py-3 text-center">HV đến</th>
                <th className="px-3 py-3 text-center">Doanh số</th>
                <th className="px-3 py-3 text-center text-red-500">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-bold text-indigo-600">{getLabel(row)}</td>
                  <td className="px-3 py-3 text-center">{row.diemDanh ?? "—"}</td>
                  <td className="px-3 py-3 text-center">{row.nhacMay ?? "—"}</td>
                  <td className="px-3 py-3 text-center">{row.goiDatLich ?? "—"}</td>
                  <td className="px-3 py-3 text-center">{row.lichMoi ?? "—"}</td>
                  <td className="px-3 py-3 text-center">{row.hvDen ?? "—"}</td>
                  <td className="px-3 py-3 text-center">{row.doanhSo?.toLocaleString("vi-VN") ?? "—"}</td>
                  <td className="px-3 py-3 text-center font-semibold text-red-500">
                    {row.doanhThu?.toLocaleString("vi-VN") ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
