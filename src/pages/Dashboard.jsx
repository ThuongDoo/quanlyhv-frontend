import { useEffect, useMemo, useState } from "react";
import { appointmentApi } from "../services/appointments";
import { authApi } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import StudentCard from "../components/StudentCard";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import DateInput from "../components/DateInput";
import {
  classificationConfig,
  ROLE_CONFIG,
  APPOINTMENT_STATUS,
  GOI_CHOT_RESULT_OPTIONS,
  LEARNING_MODE_CONFIG,
} from "../constants/studentConfig";
import LoadingOverlay from "../components/LoadingOverlay";
import { toVNDateString } from "../utils/dateHelpers";

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function appointmentToStudent(apt) {
  const s = apt.studentId || {};
  // appointmentDate là UTC từ server → convert sang VN date trước (e.g. T17:00Z → ngày hôm sau VN)
  // appointmentTime là giờ VN giữ nguyên → ghép lại với +07:00
  const aptDate = apt.appointmentDate
    ? toVNDateString(apt.appointmentDate)
    : null;
  const aptTime = apt.appointmentTime || "00:00";
  const scheduledAt = aptDate ? `${aptDate}T${aptTime}+07:00` : null;
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
    scheduledAt,
    closingCallDate: apt.closingCallDate,
    goi_chot: apt.goi_chot,
    learningMode: apt.learningMode,
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
  extraParams,
  limit,
  selectedGoiChot,
  selectedLearningMode,
}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log(appointments);

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
        if (selectedGoiChot) params.goi_chot = selectedGoiChot;
        if (selectedLearningMode) params.learningMode = selectedLearningMode;
        if (search) params.search = search;
        if (selectedClassification)
          params.clasification = selectedClassification;
        if (filterType && filterValue) params[filterType] = filterValue;
        if (extraParams) Object.assign(params, extraParams);
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
    return () => {
      cancelled = true;
    };
  }, [
    page,
    limit,
    scheduledDate,
    selectedStatus,
    selectedGoiChot,
    selectedLearningMode,
    search,
    selectedClassification,
    filterType,
    filterValue,
    extraParams,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <LoadingOverlay show={loading} />
      {appointments.length === 0 && !loading ? (
        <div className="text-center text-slate-400 py-10 text-sm">
          Không có lịch hẹn nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((apt) => (
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
  const [selectedGoiChot, setSelectedGoiChot] = useState("");
  const [selectedLearningMode, setSelectedLearningMode] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeSection, setActiveSection] = useState("owner");
  const [selectedSale, setSelectedSale] = useState("");
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const search = useDebounce(searchInput);

  useEffect(() => {
    setPage(1);
    setSelectedSale("");
    setSelectedConsultant("");
  }, [activeSection]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    scheduledDate,
    selectedStatus,
    selectedClassification,
    selectedGoiChot,
    selectedLearningMode,
    selectedSale,
    selectedConsultant,
  ]);

  useEffect(() => {
    authApi
      .fetchUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : data.users || []))
      .catch(() => {});
  }, []);

  const saleUsers = users.filter((u) => u.role === "sale");
  const consultantUsers = users.filter(
    (u) => u.role === "consultant" || u.role === "admin",
  );

  const managerExtraParams = useMemo(() => {
    const p = {};
    if (selectedSale) p.ownerUserId = selectedSale;
    if (selectedConsultant) p.consultantId = selectedConsultant;
    return p;
  }, [selectedSale, selectedConsultant]);

  const PAGE_LIMIT = 20;

  const sectionProps = {
    scheduledDate,
    selectedClassification,
    selectedStatus,
    selectedGoiChot,
    selectedLearningMode,
    search,
    users,
    page,
    limit: PAGE_LIMIT,
    onPaginationChange: setPagination,
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        {/* Row 1: tiêu đề + tabs + ngày + tìm kiếm */}
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight shrink-0">
              Chăm Sóc KH
            </h1>
            {showSwitch && (
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                {[
                  { value: "owner", role: "sale" },
                  { value: "consultant", role: "consultant" },
                  ...(user?.role === "admin"
                    ? [{ value: "manager", role: "admin" }]
                    : []),
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
            <DateInput
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Tìm tên, SĐT..."
              className="w-44"
            />
          </div>
          <Pagination
            page={page}
            totalPages={pagination.totalPages || 1}
            total={pagination.total || 0}
            limit={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </div>

        {/* Row 2: bộ lọc */}
        <div className="px-6 py-2 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center gap-2">
          {[
            {
              label: "Phân loại",
              value: selectedClassification,
              onChange: setSelectedClassification,
              options: Object.entries(classificationConfig).map(([k, v]) => ({ value: k, label: v.label })),
            },
            {
              label: "Trạng thái",
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: Object.entries(APPOINTMENT_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
            },
            {
              label: "Gọi chốt",
              value: selectedGoiChot,
              onChange: setSelectedGoiChot,
              options: GOI_CHOT_RESULT_OPTIONS.filter((o) => o.value !== "OTHER").map((o) => ({ value: o.value, label: o.label })),
            },
            {
              label: "Hình thức",
              value: selectedLearningMode,
              onChange: setSelectedLearningMode,
              options: Object.entries(LEARNING_MODE_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
            },
          ].map(({ label, value, onChange, options }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">{label}</span>
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="">Tất cả</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}

          {user?.role === "admin" && activeSection === "manager" && (
            <>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Sale</span>
                <select
                  value={selectedSale}
                  onChange={(e) => setSelectedSale(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  {saleUsers.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>{u.name || u.username || u.email}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Tư vấn</span>
                <select
                  value={selectedConsultant}
                  onChange={(e) => setSelectedConsultant(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  {consultantUsers.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>{u.name || u.username || u.email}</option>
                  ))}
                </select>
              </div>
            </>
          )}
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
              filterType={null}
              filterValue={null}
              extraParams={managerExtraParams}
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
