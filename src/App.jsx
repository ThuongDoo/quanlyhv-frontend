import { useState } from "react";
import "./App.css";

const menuItems = [
  { key: "board", label: "Bảng Chăm Sóc KH", icon: "⚡" },
  { key: "potential", label: "DS HV Tiềm Năng", icon: "👥" },
  { key: "performance", label: "Nhập Hiệu Suất Ca", icon: "📝" },
  { key: "history", label: "Lịch sử Ca Làm", icon: "📊" },
  { key: "monthly", label: "Báo cáo Tháng", icon: "📈" },
  { key: "weekly", label: "Báo cáo Tuần", icon: "📉" },
  { key: "team", label: "Nhân sự & Quỹ", icon: "❤️" },
  { key: "resources", label: "Tài nguyên & Link", icon: "🔗" },
];

const chips = [
  { label: "LOẠI 1: ƯU TIÊN", color: "bg-red-100 text-red-700" },
  { label: "LOẠI 2: ĐANG CÂN NHẮC", color: "bg-amber-100 text-amber-700" },
  { label: "LOẠI 3: KHÓ", color: "bg-slate-100 text-slate-700" },
];

const leads = [
  {
    name: "Nguyễn Thị Hồng Ngọc",
    phone: "933212846",
    id: "#1348",
    status: "ONL",
    consultant: "Chưa chia",
    school: "Chưa cập nhật",
    schedule: "14h 27/04/2026",
    scheduleStatus: "next",
    csCount: 4,
  },
  {
    name: "Hoàng Công Vinh",
    phone: "767168013",
    id: "#1347",
    status: "ONL",
    consultant: "Chưa chia",
    school: "Chưa cập nhật",
    schedule: "Chưa có lịch",
    scheduleStatus: "empty",
    csCount: 0,
  },
  {
    name: "Nguyễn Quang Tài",
    phone: "708525581",
    id: "#1346",
    status: "ONL",
    consultant: "Chưa chia",
    school: "Chưa cập nhật",
    schedule: "Chưa có lịch",
    scheduleStatus: "empty",
    csCount: 0,
  },
  {
    name: "Ngô Trung Hiệu",
    phone: "936243267",
    id: "#1345",
    status: "ONL",
    consultant: "Chưa chia",
    school: "Chưa cập nhật",
    schedule: "Chưa có lịch",
    scheduleStatus: "empty",
    csCount: 0,
  },
  {
    name: "Nguyễn Khánh Tường Vi",
    phone: "763701810",
    id: "#1344",
    status: "ONL",
    consultant: "Chưa chia",
    school: "Chưa cập nhật",
    schedule: "Chưa có lịch",
    scheduleStatus: "empty",
    csCount: 0,
  },
  {
    name: "Nguyễn Hồ Đông Hưng",
    phone: "776734756",
    id: "#1343",
    status: "ONL",
    consultant: "Chưa chia",
    school: "Chưa cập nhật",
    schedule: "Chưa có lịch",
    scheduleStatus: "empty",
    csCount: 0,
  },
];

const performanceTiles = [
  { label: "Tổng CS/ca", value: "42", accent: "bg-sky-100 text-sky-700" },
  {
    label: "Cuộc gọi thành công",
    value: "88%",
    accent: "bg-emerald-100 text-emerald-700",
  },
  { label: "Tỉ lệ hẹn", value: "72%", accent: "bg-amber-100 text-amber-700" },
];

const historyRows = [
  {
    date: "28/04/2026",
    agent: "Hồng Ngọc",
    action: "Gọi lại",
    result: "Chưa có lịch",
  },
  {
    date: "27/04/2026",
    agent: "Công Vinh",
    action: "Tư vấn",
    result: "Chưa phản hồi",
  },
  {
    date: "26/04/2026",
    agent: "Quang Tài",
    action: "Đổi lịch",
    result: "Đã xác nhận",
  },
];

const teamMembers = [
  { name: "Lê Thanh", role: "Leader", status: "Online" },
  { name: "Trần Mai", role: "Tư vấn viên", status: "Ngoại tuyến" },
  { name: "Hoàng An", role: "CS", status: "Online" },
];

function Sidebar({ selected, onChange }) {
  return (
    <aside className="sidebar hidden xl:flex xl:w-72 xl:flex-col xl:gap-6 xl:border-r xl:border-slate-200 xl:bg-white xl:px-6 xl:py-6">
      <div className="brand flex items-center gap-3 rounded-3xl bg-slate-950 px-4 py-4 text-white shadow-sm shadow-slate-200/10">
        <span className="rounded-full bg-orange-500 px-3 py-2 text-lg">🔥</span>
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Team
          </div>
          <div className="text-xl font-semibold">TEAM 102</div>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const active = selected === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function ContentHeader({ title, subtitle, children }) {
  return (
    <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.26em] text-slate-500">
          {subtitle}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Đồng bộ lúc: 23:12:14
          </span>
        </div>
      </div>
      {children}
    </header>
  );
}

function BoardContent() {
  return (
    <>
      <ContentHeader
        title="Ma Trận Tiềm Năng (Leader View)"
        subtitle="Matrix View: Ma Trận Ưu tiên CRM"
      >
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`rounded-full px-3 py-2 text-xs font-semibold ${chip.color}`}
            >
              {chip.label}
            </span>
          ))}
          <button className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
            🐻 Đang Ẩn Đã Đến/Từ chối
          </button>
        </div>
      </ContentHeader>

      <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,_1fr)]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Tìm kiếm</p>
              <p className="text-lg font-semibold text-slate-950">
                Tìm tên, SĐT...
              </p>
            </div>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Tìm
            </button>
          </div>
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="text"
              placeholder="Nhập từ khoá..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {lead.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-sky-700">
                    {lead.phone}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-sky-600 px-3 py-1 text-sm font-semibold text-white">
                    {lead.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {lead.id}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4 text-center text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Tư vấn viên
                  <div className="mt-2 text-slate-800">{lead.consultant}</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-center text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Trường học
                  <div className="mt-2 text-slate-800">{lead.school}</div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-3xl bg-slate-50 px-4 py-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm shadow-slate-200/50">
                    📅
                  </span>
                  <div>
                    <p
                      className={`font-semibold ${lead.scheduleStatus === "empty" ? "text-red-600" : "text-slate-900"}`}
                    >
                      {lead.scheduleStatus === "empty"
                        ? "Chưa có lịch"
                        : lead.schedule}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm shadow-slate-200/50">
                  CS: {lead.csCount} lần
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function PotentialContent() {
  return (
    <>
      <ContentHeader
        title="Danh sách học viên tiềm năng"
        subtitle="DS HV Tiềm Năng"
      >
        <button className="rounded-3xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          Thêm học viên mới
        </button>
      </ContentHeader>

      <section className="grid gap-5 md:grid-cols-2">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {lead.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{lead.phone}</p>
              </div>
              <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white">
                {lead.status}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Tư vấn viên
                </p>
                <p className="mt-2 font-semibold">{lead.consultant}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Lịch
                </p>
                <p className="mt-2 font-semibold">{lead.schedule}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function PerformanceContent() {
  return (
    <>
      <ContentHeader title="Hiệu suất ca" subtitle="Nhập Hiệu Suất Ca">
        <button className="rounded-3xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          Xuất báo cáo
        </button>
      </ContentHeader>

      <section className="grid gap-5 lg:grid-cols-3">
        {performanceTiles.map((tile) => (
          <div
            key={tile.label}
            className={`rounded-[30px] p-6 shadow-sm shadow-slate-200/20 ${tile.accent}`}
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-600">
              {tile.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">
              {tile.value}
            </p>
          </div>
        ))}
      </section>

      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20">
        <p className="text-sm font-semibold text-slate-500">
          Phân tích hiệu suất
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Tổng cuộc gọi
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">134</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Hẹn thành công
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">97</p>
          </div>
        </div>
      </div>
    </>
  );
}

function HistoryContent() {
  return (
    <>
      <ContentHeader title="Lịch sử ca làm" subtitle="Lịch sử Ca Làm" />
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm shadow-slate-200/20">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Ngày</th>
              <th className="px-6 py-4">Tư vấn viên</th>
              <th className="px-6 py-4">Hoạt động</th>
              <th className="px-6 py-4">Kết quả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {historyRows.map((row) => (
              <tr key={`${row.date}-${row.agent}`}>
                <td className="px-6 py-4 text-slate-700">{row.date}</td>
                <td className="px-6 py-4 text-slate-700">{row.agent}</td>
                <td className="px-6 py-4 text-slate-700">{row.action}</td>
                <td className="px-6 py-4 text-slate-700">{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ReportContent({ title, subtitle, description }) {
  return (
    <>
      <ContentHeader title={title} subtitle={subtitle} />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20">
          <p className="text-sm font-semibold text-slate-500">Tổng lượt</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">4.720</p>
          <p className="mt-4 text-sm text-slate-600">{description}</p>
        </div>
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20">
          <p className="text-sm font-semibold text-slate-500">Chuyển đổi</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">72%</p>
        </div>
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20">
          <p className="text-sm font-semibold text-slate-500">Năng suất</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">8.9</p>
        </div>
      </div>
    </>
  );
}

function TeamContent() {
  return (
    <>
      <ContentHeader title="Nhân sự & Quỹ" subtitle="Nhân sự & Quỹ" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Đội ngũ
          </p>
          <div className="mt-6 space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.role}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${member.status === "Online" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Quỹ
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Ngân sách còn lại</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                420.000.000
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Chi tiêu tháng</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                86.000.000
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ResourcesContent() {
  return (
    <>
      <ContentHeader title="Tài nguyên & Link" subtitle="Tài nguyên & Link" />
      <div className="grid gap-5 lg:grid-cols-2">
        {[
          {
            title: "Hướng dẫn CRM",
            desc: "Tài liệu nội bộ và quy trình chăm sóc khách hàng.",
            url: "#",
          },
          {
            title: "Template lịch gọi",
            desc: "Mẫu theo dõi cuộc gọi cho tư vấn viên.",
            url: "#",
          },
          {
            title: "Báo cáo mẫu",
            desc: "Cấu trúc báo cáo tuần, tháng và KPI.",
            url: "#",
          },
          {
            title: "Liên hệ support",
            desc: "Thông tin liên hệ bộ phận hỗ trợ.",
            url: "#",
          },
        ].map((item) => (
          <a
            key={item.title}
            href={item.url}
            className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/20 transition hover:border-slate-300"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="mt-3 text-sm text-slate-700">{item.desc}</p>
          </a>
        ))}
      </div>
    </>
  );
}

function ContentPanel({ selectedMenu }) {
  switch (selectedMenu) {
    case "board":
      return <BoardContent />;
    case "potential":
      return <PotentialContent />;
    case "performance":
      return <PerformanceContent />;
    case "history":
      return <HistoryContent />;
    case "monthly":
      return (
        <ReportContent
          title="Báo cáo Tháng"
          subtitle="Báo cáo Tháng"
          description="Tóm tắt hiệu suất và chuyển đổi trong tháng."
        />
      );
    case "weekly":
      return (
        <ReportContent
          title="Báo cáo Tuần"
          subtitle="Báo cáo Tuần"
          description="Tổng hợp nhanh các số liệu tuần này."
        />
      );
    case "team":
      return <TeamContent />;
    case "resources":
      return <ResourcesContent />;
    default:
      return <BoardContent />;
  }
}

function App() {
  const [selectedMenu, setSelectedMenu] = useState("board");

  return (
    <div className="app-shell min-h-screen bg-slate-50 text-slate-900">
      <Sidebar selected={selectedMenu} onChange={setSelectedMenu} />

      <main className="content mx-auto flex min-h-screen max-w-[1600px] flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <ContentPanel selectedMenu={selectedMenu} />
      </main>
    </div>
  );
}

export default App;
