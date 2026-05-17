import { useEffect, useState } from "react";
import { appointmentApi } from "../services/appointments";
import { authApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import StudentCard from "../components/StudentCard";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import DateInput from "../components/DateInput";
import { classificationConfig, statusConfig, ROLE_CONFIG } from "../constants/studentConfig";
import LoadingOverlay from "../components/LoadingOverlay";

const APPOINTMENT_STATUS = {
  ...statusConfig,
  CANCELLED: {
    label: "ĐÃ HUỶ",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function appointmentToStudent(apt) {
  const s = apt.studentId || {};
  const aptDate = apt.appointmentDate
    ? apt.appointmentDate.split("T")[0]
    : null;
  const aptTime = apt.appointmentTime || null;
  return {
    _id: s._id,
    name: s.name,
    phone: s.phone,
    clasification: s.clasification,
    insights: s.insights,
    campaign: s.campaign,
    university: s.university,
    ownerUserId: apt.ownerUserId?._id || apt.ownerUserId,
    consultant: apt.consultantId,
    scheduledAt: aptDate ? `${aptDate}T${aptTime || "00:00"}` : null,
    closingCallDate: apt.closingCallDate,
    status: apt.status,
  };
}

function AppointmentSection({
  filterType,
  filterValue,
  scheduledDate,
  selectedClassification,
  selectedStatus,
  search,
  users,
  page,
  onPaginationChange,
}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const params = { page, limit };
        if (scheduledDate) {
          params.appointmentDateFrom = `${scheduledDate}T00:00:00+07:00`;
          params.appointmentDateTo = `${scheduledDate}T23:59:59+07:00`;
        }
        if (selectedStatus !== "") params.status = selectedStatus;
        if (filterType && filterValue) params[filterType] = filterValue;
        const res = await appointmentApi.getAll(params);
        if (!cancelled) {
          setAppointments(res.appointments || []);
          onPaginationChange(res.pagination || { total: 0, totalPages: 1 });
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, limit, scheduledDate, selectedStatus, filterType, filterValue]);

  const filtered = appointments.filter((apt) => {
    const s = apt.studentId || {};
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.phone?.includes(search);
    const matchClass = !selectedClassification || (s.clasification || "0") === selectedClassification;
    return matchSearch && matchClass;
  });

  return (
    <div className="flex flex-col gap-4">
      <LoadingOverlay show={loading} />
      {filtered.length === 0 && !loading ? (
        <div className="text-center text-slate-400 py-10 text-sm">Không có lịch hẹn nào.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((apt) => (
            <StudentCard
              key={apt._id}
              student={appointmentToStudent(apt)}
              users={users}
              appointmentId={apt._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const showSwitch = user?.role === "consultant" || user?.role === "admin";
  const userId = user?._id || user?.id;
  const today = toDateInput(new Date());

  const [users, setUsers] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(today);
  const [selectedClassification, setSelectedClassification] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeSection, setActiveSection] = useState("owner");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const search = useDebounce(searchInput);

  useEffect(() => { setPage(1); }, [search, scheduledDate, selectedStatus, selectedClassification, activeSection]);

  useEffect(() => {
    authApi
      .fetchUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : data.users || []))
      .catch(() => {});
  }, []);

  const sectionProps = {
    scheduledDate,
    selectedClassification,
    selectedStatus,
    search,
    users,
    page,
    onPaginationChange: setPagination,
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        {/* Row 1 */}
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
              Bảng Chăm Sóc Khách Hàng
            </h1>
            {showSwitch && (
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                {[
                  { value: "owner",      role: "sale" },
                  { value: "consultant", role: "consultant" },
                  ...(user?.role === "admin" ? [{ value: "manager", role: "admin" }] : []),
                ].map((tab, i) => {
                  const cfg = ROLE_CONFIG[tab.role];
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveSection(tab.value)}
                      className={`px-4 py-1.5 text-xs font-bold transition border ${i > 0 ? "border-l" : "border-0"} ${
                        activeSection === tab.value
                          ? cfg.className
                          : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <label className="font-medium shrink-0 text-xs">Ngày</label>
              <DateInput
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Tìm tên, SĐT..."
              className="w-44"
            />
          </div>
        </div>

        {/* Row 2: filters */}
        <div className="px-6 py-2 border-t border-slate-100 flex items-center gap-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Phân loại
            </span>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">Tất cả</option>
              {Object.entries(classificationConfig).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-slate-200 shrink-0" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Trạng thái
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">Tất cả</option>
              {Object.entries(APPOINTMENT_STATUS).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-slate-200 shrink-0" />

          <Pagination
            page={page}
            totalPages={pagination.totalPages || 1}
            total={pagination.total || 0}
            limit={20}
            onPageChange={setPage}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {showSwitch ? (
          activeSection === "owner" ? (
            <AppointmentSection
              key="owner"
              filterType="ownerUserId"
              filterValue={userId}
              {...sectionProps}
            />
          ) : activeSection === "consultant" ? (
            <AppointmentSection
              key="consultant"
              filterType="consultantId"
              filterValue={userId}
              {...sectionProps}
            />
          ) : (
            <AppointmentSection
              key="manager"
              filterType="managerId"
              filterValue={userId}
              {...sectionProps}
            />
          )
        ) : (
          <AppointmentSection
            filterType={null}
            filterValue={null}
            {...sectionProps}
          />
        )}
      </div>
    </div>
  );
}
