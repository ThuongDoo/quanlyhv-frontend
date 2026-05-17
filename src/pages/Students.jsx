import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { studentApi } from "../services/students";
import { authApi } from "../services/auth";
import { appointmentApi } from "../services/appointments";
import { getUser } from "../hooks/useAuth";
import StepCell from "../components/StepCell";
import ScheduleForm from "../components/ScheduleForm";
import LoadingOverlay from "../components/LoadingOverlay";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import FilterDropdown from "../components/FilterDropdown";
import {
  classificationConfig,
  statusConfig,
  STEP_CONFIG,
  MOBILE_CARRIER_OPTIONS,
} from "../constants/studentConfig";

export default function Students() {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [page, setPage] = useState(1);
  const [limit] = useState(80);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 80,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingReload, setPendingReload] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const [editingClassification, setEditingClassification] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [filters, setFilters] = useState({});
  const [openFilterCol, setOpenFilterCol] = useState(null);
  const [filterAnchorRect, setFilterAnchorRect] = useState(null);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [assignResult, setAssignResult] = useState(null);
  const [lastSelectedIdx, setLastSelectedIdx] = useState(null);
  const [scheduleModal, setScheduleModal] = useState({
    open: false,
    studentId: null,
    date: "",
    hour: "",
    minute: "00",
    consultantId: "",
  });
  const closeScheduleModal = () =>
    setScheduleModal({ open: false, studentId: null, date: "", hour: "", minute: "00", consultantId: "" });
  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    year: new Date().getFullYear(),
    mobileCarrier: "",
    university: "",
  });

  const toggleFilter = (col, value) => {
    setFilters((prev) => {
      const current = prev[col] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [col]: updated };
    });
    setPage(1);
  };

  const clearFilter = (col) => {
    setFilters((prev) => ({ ...prev, [col]: [] }));
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).reduce(
    (sum, arr) => sum + (arr?.length || 0),
    0,
  );

  const filterOptions = useMemo(() => {
    const unique = (arr) => [...new Set(arr.filter(Boolean))];
    return {
      mobileCarrier: MOBILE_CARRIER_OPTIONS,
      clasification: Object.entries(classificationConfig).map(
        ([value, cfg]) => ({ value, label: cfg.label }),
      ),
      university: universities.map((v) => ({ value: v, label: v })),
      ownerUserId: unique(students.map((s) => s.ownerUserId)).map((id) => {
        const u = users.find((x) => (x._id || x.id) === id);
        return { value: id, label: u?.name || u?.username || id };
      }),
      consultant: users.map((u) => ({
        value: u._id || u.id,
        label: u.name || u.username || u.email,
      })),
      status: Object.entries(statusConfig).map(([value, cfg]) => ({
        value,
        label: cfg.label,
      })),
      currentStepKey: Object.entries(STEP_CONFIG).map(([value, cfg]) => ({
        value,
        label: cfg.label,
      })),
    };
  }, [students, users, universities]);

  // Only clasification is filtered client-side (backend doesn't support it).
  // All other filters are sent as query params to the API.
  const filteredStudents = useMemo(() => {
    if (!filters.clasification?.length) return students;
    return students.filter((s) =>
      filters.clasification.includes(s.clasification || "0"),
    );
  }, [students, filters.clasification]);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, search };
      if (filters.mobileCarrier?.length)
        params.mobileCarrier = filters.mobileCarrier;
      if (filters.university?.length) params.university = filters.university;
      if (filters.ownerUserId?.length) params.ownerUserId = filters.ownerUserId;
      if (filters.status?.length) params.status = filters.status;
      if (filters.currentStepKey?.length)
        params.currentStepKey = filters.currentStepKey[0] ?? "null";
      const response = await studentApi.fetchStudents(params);

      setStudents(response.students || []);
      setPagination(
        response.pagination || { page, limit, total: 0, totalPages: 1 },
      );
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Không thể tải danh sách học viên.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    authApi
      .fetchUsers()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : data.users || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    studentApi
      .fetchUniversities()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.universities || [];
        setUniversities(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await studentApi.createStudent({
        name: newStudent.name,
        phone: newStudent.phone,
        year: Number(newStudent.year),
        mobileCarrier: newStudent.mobileCarrier,
        university: newStudent.university,
      });
      setNewStudent({
        name: "",
        phone: "",
        year: new Date().getFullYear(),
        mobileCarrier: "",
        university: "",
      });
      setShowCreatePanel(false);
      loadStudents();
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Không thể tạo học viên.",
      );
    }
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();
    if (!importFile) {
      setImportMessage("Vui lòng chọn file Excel trước khi import.");
      return;
    }

    try {
      const response = await studentApi.importStudents(importFile);
      console.log(response);

      setImportMessage(response.message || "Import hoàn tất.");
      setImportFile(null);
      loadStudents();
    } catch (err) {
      setImportMessage(
        err?.response?.data?.error || err?.message || "Import thất bại.",
      );
    }
  };

  const handleClassificationChange = async (studentId, newClassification) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        const id = student.id || student._id;
        if (id !== studentId) return student;
        return { ...student, clasification: newClassification };
      }),
    );
    setEditingClassification(null);
    try {
      await studentApi.updateStudent(studentId, {
        clasification: newClassification,
      });
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Không thể cập nhật phân loại.",
      );
      setPendingReload(true);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        (s.id || s._id) === studentId ? { ...s, status: newStatus } : s,
      ),
    );
    setEditingStatus(null);
    try {
      await studentApi.updateStudent(studentId, { status: newStatus });
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Không thể cập nhật trạng thái.",
      );
      setPendingReload(true);
    }
  };

  const handleNoteSave = async (studentId) => {
    const draft = noteDraft;
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        const id = student.id || student._id;
        if (id !== studentId) return student;
        return { ...student, insights: [draft] };
      }),
    );
    setEditingNoteId(null);
    setNoteDraft("");
    try {
      await studentApi.updateStudent(studentId, {
        insights: [draft],
      });
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Không thể cập nhật note.",
      );
      setPendingReload(true);
    }
  };

  const handleToggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAllStudents = (selectAll) => {
    if (selectAll) {
      setSelectedStudents(new Set(students.map((s) => s.id || s._id)));
    } else {
      setSelectedStudents(new Set());
    }
    setLastSelectedIdx(null);
  };

  const openAssignPanel = async () => {
    setShowAssignPanel(true);
    if (users.length === 0) {
      try {
        setUsersLoading(true);
        const data = await authApi.fetchUsers();
        setUsers(Array.isArray(data) ? data : data.users || []);
      } catch {
        setAssignMessage("Không thể tải danh sách người dùng.");
      } finally {
        setUsersLoading(false);
      }
    }
  };

  const handleAssignSubmit = async (event) => {
    event.preventDefault();
    if (selectedStudents.size === 0) {
      setAssignMessage("Vui lòng chọn ít nhất một học viên.");
      return;
    }
    if (!assignUserId) {
      setAssignMessage("Vui lòng chọn người dùng để gán.");
      return;
    }

    try {
      setAssignLoading(true);
      const result = await studentApi.assignStudentToUser(
        Array.from(selectedStudents),
        assignUserId,
      );
      setSelectedStudents(new Set());
      setAssignUserId("");
      setShowAssignPanel(false);
      loadStudents();
      setAssignResult({ type: "success", text: `${result.stats?.modified ?? selectedStudents.size} học viên đã được gán thành công.` });
    } catch (err) {
      setAssignResult({ type: "error", text: err.message || "Không thể gán học viên." });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleStepChange = async (studentId, key, value) => {
    const config = STEP_CONFIG[key];
    const payload = {
      key,
      isDone: true,
      data: {},
    };

    if (config?.dateField) {
      payload.data[config.dateField] = value || null;
    } else {
      payload.data.result = value || null;
    }

    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        const id = student.id || student._id;
        if (id !== studentId) return student;
        const newData = config?.dateField
          ? { [config.dateField]: value }
          : { result: value };
        const updatedSteps = Array.isArray(student.steps)
          ? student.steps.some((s) => s.key === key)
            ? student.steps.map((step) =>
                step.key === key
                  ? {
                      ...step,
                      isDone: true,
                      data: { ...step.data, ...newData },
                    }
                  : step,
              )
            : [...student.steps, { key, isDone: true, data: newData }]
          : {
              ...student.steps,
              [key]: {
                ...student.steps?.[key],
                isDone: true,
                data: { ...student.steps?.[key]?.data, ...newData },
              },
            };
        return { ...student, steps: updatedSteps };
      }),
    );
    setEditingStep(null);
    try {
      await studentApi.updateStep(studentId, payload);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Không thể cập nhật bước.",
      );
      setPendingReload(true);
    }
  };

  const handleScheduleSave = async () => {
    const { studentId, date, hour, minute, consultantId } = scheduleModal;
    const time = `${hour || "00"}:${minute || "00"}`;
    const scheduledAt = date ? `${date}T${time}` : null;
    setStudents((prev) =>
      prev.map((s) =>
        (s.id || s._id) === studentId
          ? { ...s, consultant: consultantId, scheduledAt }
          : s,
      ),
    );
    closeScheduleModal();
    try {
      await Promise.all([
        studentApi.scheduleStudent(studentId, { consultantId, scheduledAt }),
        appointmentApi.create({
          studentId,
          consultantId,
          appointmentDate: scheduledAt,
          appointmentTime: time,
          ownerUserId: currentUser?._id || currentUser?.id,
        }),
      ]);
      setScheduleResult({ type: "success", text: "Đặt lịch hẹn thành công!" });
    } catch (err) {
      const raw = err?.response?.data?.error || err?.message || "";
      const text = raw.toLowerCase().includes("owneruserid")
        ? "Đặt lịch không thành công do học viên này chưa có người sale phụ trách."
        : err.message || "Không thể đặt lịch hẹn.";
      setScheduleResult({ type: "error", text });
      setPendingReload(true);
    }
  };

  const renderStepCell = (student, key) => {
    return (
      <StepCell
        student={student}
        stepKey={key}
        editingStep={editingStep}
        onEditingChange={setEditingStep}
        onStepChange={handleStepChange}
      />
    );
  };

  const totalPages = pagination.totalPages || 1;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <LoadingOverlay show={loading} />
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between  top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
              Danh sách học viên
            </h1>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
            {pagination.total || students.length} Leads
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Tìm tên, SĐT hoặc năm..."
            className="w-64"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreatePanel((value) => !value)}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Thêm học viên
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowImportPanel((value) => !value)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Nhập Excel
              </button>
            )}
          </div>
        </div>
      </div>

      {openFilterCol && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => { setOpenFilterCol(null); setFilterAnchorRect(null); }}
        />
      )}
      <FilterDropdown
        rect={filterAnchorRect}
        options={filterOptions[openFilterCol] || []}
        selected={filters[openFilterCol] || []}
        onToggle={(value) => toggleFilter(openFilterCol, value)}
        onClear={() => clearFilter(openFilterCol)}
      />

      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">
              Bước hiện tại:
            </span>
            <select
              value={filters.currentStepKey?.length ? (filters.currentStepKey[0] ?? "__null__") : ""}
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  currentStepKey: val === "" ? [] : [val === "__null__" ? null : val],
                }));
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">Tất cả</option>
              <option value="__null__">Chưa xử lý</option>
              {Object.entries(STEP_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => { setFilters({}); setPage(1); }}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-100 transition"
              >
                Xóa tất cả ({activeFilterCount})
              </button>
            )}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={pagination.total || 0}
            limit={limit}
            onPageChange={setPage}
          />
        </div>

        {showCreatePanel && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Tạo học viên mới
            </h2>
            <form
              onSubmit={handleCreateSubmit}
              className="grid gap-4 lg:grid-cols-3"
            >
              <label className="space-y-2 text-sm text-slate-700">
                Họ tên
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Số điện thoại
                <input
                  type="tel"
                  value={newStudent.phone}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="0987654321"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Trường
                <input
                  type="text"
                  value={newStudent.university}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      university: e.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="UIT"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Năm
                <input
                  type="number"
                  value={newStudent.year}
                  onChange={(e) =>
                    setNewStudent((prev) => ({ ...prev, year: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Nhà mạng
                <select
                  value={newStudent.mobileCarrier}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      mobileCarrier: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Chọn nhà mạng</option>
                  <option value="Viettel">Viettel</option>
                  <option value="Mobifone">Mobifone</option>
                  <option value="Vinaphone">Vinaphone</option>
                  <option value="Vietnamobile">Vietnamobile</option>
                  <option value="Gmobile">Gmobile</option>
                </select>
              </label>
              <div className="lg:col-span-3 flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Lưu học viên
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePanel(false)}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex-1 min-h-0 flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {selectedStudents.size > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-indigo-50 border-b border-indigo-200">
              <span className="text-sm font-semibold text-indigo-700">
                Đã chọn {selectedStudents.size} học viên
              </span>
              <div className="flex gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={openAssignPanel}
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Gán cho người dùng
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStudents(new Set())}
                  className="rounded-2xl border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full table-fixed text-sm">
              <thead className="sticky top-0 z-[3] border-b border-slate-200 bg-slate-50 shadow-sm">
                <tr>
                  <th className="w-10 px-4 py-3 text-center sticky left-0 z-[4] bg-slate-50">
                    <input
                      type="checkbox"
                      checked={
                        students.length > 0 &&
                        selectedStudents.size === students.length
                      }
                      onChange={(e) =>
                        handleSelectAllStudents(e.target.checked)
                      }
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="w-40 px-4 py-3 text-left font-semibold text-slate-600 sticky left-10 z-[4] bg-slate-50">
                    Họ Tên
                  </th>
                  <th className="w-32 px-4 py-3 text-left font-semibold text-slate-600 sticky left-[200px] z-[4] bg-slate-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                    SĐT
                  </th>
                  <th className="w-16 px-4 py-3 text-left font-semibold text-slate-600">
                    Năm
                  </th>
                  {[
                    { col: "mobileCarrier", label: "Nhà mạng", width: "w-28" },
                    { col: "clasification", label: "Phân Loại", width: "w-28" },
                    { col: "university", label: "Trường", width: "w-44" },
                    { col: "ownerUserId", label: "Sale Mới", width: "w-32" },
                  ].map(({ col, label, width }) => (
                    <th
                      key={col}
                      className={`${width} px-4 py-3 text-left font-semibold text-slate-600`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          if (openFilterCol === col) {
                            setOpenFilterCol(null);
                            setFilterAnchorRect(null);
                          } else {
                            setOpenFilterCol(col);
                            setFilterAnchorRect(e.currentTarget.getBoundingClientRect());
                          }
                        }}
                        className={`flex items-center gap-1.5 hover:text-indigo-600 transition ${filters[col]?.length ? "text-indigo-600" : ""}`}
                      >
                        {label}
                        {filters[col]?.length > 0 && (
                          <span className="bg-indigo-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                            {filters[col].length}
                          </span>
                        )}
                        <span className="text-xs opacity-50">▾</span>
                      </button>
                    </th>
                  ))}
                  <th className="w-36 px-4 py-3 text-left font-semibold text-slate-600">
                    Làm Ấm
                  </th>
                  <th className="w-36 px-4 py-3 text-left font-semibold text-slate-600">
                    Liên hệ Lần 1
                  </th>
                  <th className="w-36 px-4 py-3 text-left font-semibold text-slate-600">
                    Liên hệ Lần 2
                  </th>
                  <th className="w-36 px-4 py-3 text-left font-semibold text-slate-600">
                    Liên hệ Lần 3
                  </th>
                  <th className="w-36 px-4 py-3 text-left font-semibold text-slate-600">
                    Lịch hẹn
                  </th>
                  <th className="w-52 px-4 py-3 text-left font-semibold text-slate-600">
                    Note Vấn đề
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Không tìm thấy học viên.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const classification =
                      classificationConfig[student.clasification || "0"];
                    const status =
                      statusConfig[student.status] ||
                      Object.values(statusConfig)[0];
                    const ownerId = student.ownerUserId;
                    const ownerUser = users.find(
                      (u) => (u._id || u.id) === ownerId,
                    );
                    const consultantName =
                      ownerUser?.name ||
                      ownerUser?.username ||
                      student.consultant?.name ||
                      student.saleMoi ||
                      "-";
                    const note = Array.isArray(student.insights)
                      ? student.insights[0] || "-"
                      : student.insights || "-";

                    return (
                      <tr
                        key={student.id || student._id || idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                      >
                        <td className={`px-4 py-4 text-center sticky left-0 z-[1] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.id || student._id)}
                            onChange={(e) => {
                              const sid = student.id || student._id;
                              if (e.nativeEvent.shiftKey && lastSelectedIdx !== null) {
                                const start = Math.min(lastSelectedIdx, idx);
                                const end = Math.max(lastSelectedIdx, idx);
                                setSelectedStudents((prev) => {
                                  const next = new Set(prev);
                                  filteredStudents.slice(start, end + 1).forEach((s) => next.add(s.id || s._id));
                                  return next;
                                });
                              } else {
                                handleToggleStudentSelection(sid);
                                setLastSelectedIdx(idx);
                              }
                            }}
                            className="rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className={`px-4 py-4 text-slate-800 font-medium whitespace-nowrap sticky left-10 z-[1] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                          {student.name || "-"}
                        </td>
                        <td className={`px-4 py-4 text-blue-500 whitespace-nowrap sticky left-[200px] z-[1] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                          {student.phone || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                          {student.year || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                          {student.mobileCarrier || "-"}
                        </td>
                        <td className="px-4 py-4">
                          {editingClassification ===
                          (student.id || student._id) ? (
                            <select
                              value={student.clasification || "0"}
                              onChange={(e) =>
                                handleClassificationChange(
                                  student.id || student._id,
                                  e.target.value,
                                )
                              }
                              onBlur={() => setEditingClassification(null)}
                              onFocus={(e) => {
                                const el = e.currentTarget;
                                setTimeout(() => el?.click(), 0);
                              }}
                              autoFocus
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                              {Object.entries(classificationConfig).map(
                                ([key, cfg]) => (
                                  <option key={key} value={key}>
                                    {cfg.label}
                                  </option>
                                ),
                              )}
                            </select>
                          ) : (
                            <span
                              onClick={() =>
                                setEditingClassification(
                                  student.id || student._id,
                                )
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer hover:bg-opacity-80 transition ${classification.className}`}
                            >
                              {classification.label}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                          {student.university || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                          {consultantName}
                        </td>
                        <td className="px-4 py-4">
                          {renderStepCell(student, "warm")}
                        </td>
                        <td className="px-4 py-4">
                          {renderStepCell(student, "call1")}
                        </td>
                        <td className="px-4 py-4">
                          {renderStepCell(student, "call2")}
                        </td>
                        <td className="px-4 py-4">
                          {renderStepCell(student, "call3")}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setScheduleModal({
                                open: true,
                                studentId: student.id || student._id,
                                date: "",
                                hour: "",
                                minute: "00",
                                consultantId:
                                  student.consultant?._id ||
                                  student.consultant?.id ||
                                  student.consultant ||
                                  "",
                              })
                            }
                            className="rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"
                          >
                            Hẹn lịch
                          </button>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <div
                            onClick={() => {
                              setEditingNoteId(student.id || student._id);
                              setNoteDraft(note === "-" ? "" : note);
                            }}
                            className="cursor-pointer truncate rounded-2xl border border-transparent px-2 py-2 text-sm hover:border-slate-300 hover:bg-slate-50 transition"
                            title={note !== "-" ? note : undefined}
                          >
                            {note !== "-" ? (
                              note
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-red-500 text-xl">⚠️</span>
              <p className="flex-1 text-sm text-slate-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setError("");
                if (pendingReload) {
                  setPendingReload(false);
                  loadStudents();
                }
              }}
              className="mt-5 w-full rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {assignResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl flex flex-col items-center gap-4">
            {assignResult.type === "success" ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <p className="text-base font-bold text-slate-800 text-center">{assignResult.text}</p>
            <button
              type="button"
              onClick={() => setAssignResult(null)}
              className={`w-full rounded-2xl py-3 text-sm font-bold text-white transition ${assignResult.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {scheduleResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl flex flex-col items-center gap-4">
            {scheduleResult.type === "success" ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <p className="text-base font-bold text-slate-800 text-center">{scheduleResult.text}</p>
            <button
              type="button"
              onClick={() => { setScheduleResult(null); if (scheduleResult.type === "error") { setPendingReload(false); loadStudents(); } }}
              className={`w-full rounded-2xl py-3 text-sm font-bold text-white transition ${scheduleResult.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {scheduleModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeScheduleModal}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-slate-900 mb-5">Đặt lịch hẹn</h2>
            <ScheduleForm
              date={scheduleModal.date}
              hour={scheduleModal.hour}
              minute={scheduleModal.minute}
              consultantId={scheduleModal.consultantId}
              users={users}
              onDateChange={(v) => setScheduleModal((p) => ({ ...p, date: v }))}
              onHourChange={(v) => setScheduleModal((p) => ({ ...p, hour: v }))}
              onMinuteChange={(v) => setScheduleModal((p) => ({ ...p, minute: v }))}
              onConsultantChange={(v) => setScheduleModal((p) => ({ ...p, consultantId: v }))}
              onSave={handleScheduleSave}
              onCancel={closeScheduleModal}
              saving={false}
            />
          </div>
        </div>
      )}

      {showImportPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setShowImportPanel(false);
            setImportMessage("");
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-slate-900 mb-5">
              Import học viên từ Excel
            </h2>
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <label className="block space-y-2 text-sm text-slate-700">
                Chọn file Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </label>
              {importMessage && (
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {importMessage}
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Nhập file
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportPanel(false);
                    setImportMessage("");
                  }}
                  className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setShowAssignPanel(false);
            setAssignMessage("");
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-slate-900 mb-5">
              Gán {selectedStudents.size} học viên cho người dùng
            </h2>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <label className="space-y-2 text-sm text-slate-700">
                Chọn người dùng
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  disabled={usersLoading}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value="">
                    {usersLoading ? "Đang tải..." : "-- Chọn người dùng --"}
                  </option>
                  {users.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name || u.username || u.email}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {assignLoading ? "Đang gán..." : "Gán ngay"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignPanel(false);
                    setAssignMessage("");
                  }}
                  className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingNoteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setEditingNoteId(null);
            setNoteDraft("");
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Note vấn đề
            </h2>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={5}
              autoFocus
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
              placeholder="Nhập note vấn đề..."
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleNoteSave(editingNoteId)}
                className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingNoteId(null);
                  setNoteDraft("");
                }}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
