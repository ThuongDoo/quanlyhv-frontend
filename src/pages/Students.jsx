import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useDebounce } from "../hooks/useDebounce";
import { fmtDate, fmtDateTime, toVNDateString } from "../utils/dateHelpers";
import { studentApi } from "../services/students";
import { authApi } from "../services/auth";
import { appointmentApi } from "../services/appointments";
import { getUser } from "../hooks/useAuth";
import StepCell from "../components/StepCell";
import ScheduleForm from "../components/ScheduleForm";
import ConfirmModal from "../components/ConfirmModal";
import LoadingOverlay from "../components/LoadingOverlay";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import FilterDropdown from "../components/FilterDropdown";
import DateRangeFilter from "../components/DateRangeFilter";
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
  const [importResult, setImportResult] = useState(null);
  const [editingClassification, setEditingClassification] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [editingProcessing, setEditingProcessing] = useState(null); // { id, date, shift }
  const [editingScheduledAt, setEditingScheduledAt] = useState(null); // { id, date, hour, minute }
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [createResult, setCreateResult] = useState(null); // { type: "success"|"error", message }
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null); // { type: "success"|"error", message }
  const [noteDraft, setNoteDraft] = useState("");
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
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
    setScheduleModal({
      open: false,
      studentId: null,
      date: "",
      hour: "",
      minute: "00",
      consultantId: "",
    });
  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    year: 0,
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

  const activeFilterCount = Object.entries(filters).reduce((sum, [key, val]) => {
    if (key === "processingDate") return sum + (val?.from ? 1 : 0) + (val?.to ? 1 : 0);
    return sum + (val?.length || 0);
  }, 0);

  const filterOptions = useMemo(() => {
    const unique = (arr) => [...new Set(arr.filter(Boolean))];
    return {
      year: [
        { value: 1, label: "Năm 1" },
        { value: 2, label: "Năm 2" },
        { value: 3, label: "Năm 3" },
        { value: 4, label: "Năm 4" },
        { value: 0, label: "Không xác định" },
      ],
      mobileCarrier: MOBILE_CARRIER_OPTIONS,
      clasification: Object.entries(classificationConfig).map(
        ([value, cfg]) => ({ value, label: cfg.label }),
      ),
      university: universities.map((v) => ({ value: v, label: v })),
      ownerUserId: [
        { value: null, label: "Trống" },
        ...users.map((u) => ({
          value: u._id || u.id,
          label: u.name || u.username || u.email,
        })),
      ],
      consultant: users.map((u) => ({
        value: u._id || u.id,
        label: u.name || u.username || u.email,
      })),
      campaign: [
        { value: "__empty__", label: "Trống" },
        ...campaigns.map((c) => ({ value: c, label: c })),
      ],
      scheduledAt: [
        { value: "has", label: "Có lịch" },
        { value: "empty", label: "Không có lịch" },
      ],
      status: Object.entries(statusConfig).map(([value, cfg]) => ({
        value,
        label: cfg.label,
      })),
      currentStepKey: Object.entries(STEP_CONFIG).map(([value, cfg]) => ({
        value,
        label: cfg.label,
      })),
      warm: STEP_CONFIG.warm.resultOptions,
      call1: STEP_CONFIG.call1.resultOptions,
      call2: STEP_CONFIG.call2.resultOptions,
      call3: STEP_CONFIG.call3.resultOptions,
    };
  }, [students, users, universities]);

  // Only clasification is filtered client-side (backend doesn't support it).
  // All other filters are sent as query params to the API.
  const filteredStudents = useMemo(() => {
    let result = students;
    if (filters.clasification?.length)
      result = result.filter((s) =>
        filters.clasification.includes(s.clasification || ""),
      );

    if (filters.scheduledAt?.length) {
      const hasFilter = filters.scheduledAt.includes("has");
      const emptyFilter = filters.scheduledAt.includes("empty");
      result = result.filter((s) => {
        if (hasFilter && emptyFilter) return true;
        if (hasFilter) return Boolean(s.scheduledAt);
        if (emptyFilter) return !s.scheduledAt;
        return true;
      });
    }
    const SHIFT_ORDER = { S: 0, C: 1, T: 2 };
    result = [...result].sort((a, b) => {
      const da = a.processingDate ?? "";
      const db = b.processingDate ?? "";
      if (da !== db) return da < db ? -1 : 1;
      return (SHIFT_ORDER[a.processingShift] ?? 9) - (SHIFT_ORDER[b.processingShift] ?? 9);
    });
    return result;
  }, [students, filters.clasification, filters.scheduledAt]);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, search };
      if (filters.year?.length) params.year = filters.year;
      if (filters.mobileCarrier?.length)
        params.mobileCarrier = filters.mobileCarrier;
      if (filters.university?.length) params.university = filters.university;
      if (filters.ownerUserId?.length) params.ownerUserId = filters.ownerUserId;
      if (filters.status?.length) params.status = filters.status;
      if (filters.currentStepKey?.length)
        params.currentStepKey = filters.currentStepKey[0] ?? "null";
      if (filters.campaign?.length) params.campaign = filters.campaign;
      if (filters.processingDate?.from) params.processingDateFrom = filters.processingDate.from;
      if (filters.processingDate?.to) params.processingDateTo = filters.processingDate.to;
      if (filters.warm?.length) params.warmResult = filters.warm;
      if (filters.call1?.length) params.call1Result = filters.call1;
      if (filters.call2?.length) params.call2Result = filters.call2;
      if (filters.call3?.length) params.call3Result = filters.call3;
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
    studentApi
      .fetchCampaigns()
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
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
      setCreateResult({
        type: "success",
        message: `Đã thêm học viên "${newStudent.name}" thành công!`,
      });
    } catch (err) {
      setCreateResult({
        type: "error",
        message:
          err?.response?.data?.error ||
          err?.message ||
          "Không thể tạo học viên.",
      });
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
      setImportFile(null);
      setShowImportPanel(false);
      setImportMessage("");
      setImportResult(response);
      loadStudents();
    } catch (err) {
      setImportMessage(
        err?.response?.data?.error || err?.message || "Import thất bại.",
      );
    }
  };

  const handleClassificationChange = async (studentId, newClassification) => {
    const value = newClassification || null;
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        const id = student.id || student._id;
        if (id !== studentId) return student;
        return { ...student, clasification: value };
      }),
    );
    setEditingClassification(null);
    try {
      await studentApi.updateStudent(studentId, {
        clasification: value,
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

  const handleBulkDelete = () => setDeleteConfirm(true);

  const executeBulkDelete = async () => {
    const ids = Array.from(selectedStudents);
    const count = ids.length;
    setDeleteConfirm(false);
    setStudents((prev) => prev.filter((s) => !ids.includes(s.id || s._id)));
    setSelectedStudents(new Set());
    try {
      await Promise.all(ids.map((id) => studentApi.deleteStudent(id)));
      setDeleteResult({
        type: "success",
        message: `Đã xoá thành công ${count} học viên.`,
      });
    } catch (err) {
      setDeleteResult({
        type: "error",
        message: err?.response?.data?.error || "Xoá thất bại.",
      });
      setPendingReload(true);
    }
  };

  const handleScheduledAtSave = async () => {
    if (!editingScheduledAt) return;
    const { id, date, hour, minute } = editingScheduledAt;
    const scheduledAt = date
      ? `${date}T${hour || "00"}:${minute || "00"}`
      : null;
    setStudents((prev) =>
      prev.map((s) => ((s.id || s._id) === id ? { ...s, scheduledAt } : s)),
    );
    setEditingScheduledAt(null);
    try {
      await studentApi.updateStudent(id, { scheduledAt });
    } catch (err) {
      setError(err?.response?.data?.error || "Không thể cập nhật ngày hẹn.");
      setPendingReload(true);
    }
  };

  const handleProcessingSave = async () => {
    if (!editingProcessing) return;
    const { id, date, shift } = editingProcessing;
    setStudents((prev) =>
      prev.map((s) =>
        (s.id || s._id) === id
          ? {
              ...s,
              processingDate: date || null,
              processingShift: shift || null,
            }
          : s,
      ),
    );
    setEditingProcessing(null);
    try {
      await studentApi.updateStudent(id, {
        processingDate: date || null,
        processingShift: shift || null,
      });
    } catch (err) {
      setError(err?.response?.data?.error || "Không thể cập nhật ngày xử lý.");
      setPendingReload(true);
    }
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
      setAssignResult({
        type: "success",
        text: `${result.stats?.modified ?? selectedStudents.size} học viên đã được gán thành công.`,
      });
    } catch (err) {
      setAssignResult({
        type: "error",
        text: err.message || "Không thể gán học viên.",
      });
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
          onClick={() => {
            setOpenFilterCol(null);
            setFilterAnchorRect(null);
          }}
        />
      )}
      {openFilterCol === "processingDate" ? (
        <DateRangeFilter
          rect={filterAnchorRect}
          from={filters.processingDate?.from ?? ""}
          to={filters.processingDate?.to ?? ""}
          onChange={(val) => {
            setFilters((prev) => ({ ...prev, processingDate: val }));
            setPage(1);
          }}
          onClear={() => {
            setFilters((prev) => ({ ...prev, processingDate: { from: "", to: "" } }));
            setPage(1);
          }}
        />
      ) : (
        <FilterDropdown
          rect={filterAnchorRect}
          options={filterOptions[openFilterCol] || []}
          selected={filters[openFilterCol] || []}
          onToggle={(value) => toggleFilter(openFilterCol, value)}
          onClear={() => clearFilter(openFilterCol)}
        />
      )}

      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">
              Bước hiện tại:
            </span>
            <select
              value={
                filters.currentStepKey?.length
                  ? (filters.currentStepKey[0] ?? "__null__")
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  currentStepKey:
                    val === "" ? [] : [val === "__null__" ? null : val],
                }));
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="">Tất cả</option>
              <option value="__null__">Chưa xử lý</option>
              {Object.entries(STEP_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>
                  {c.label}
                </option>
              ))}
            </select>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFilters({});
                  setPage(1);
                }}
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
                <select
                  value={newStudent.year}
                  onChange={(e) =>
                    setNewStudent((prev) => ({
                      ...prev,
                      year: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value={0}>Không xác định</option>
                  <option value={1}>Năm 1</option>
                  <option value={2}>Năm 2</option>
                  <option value={3}>Năm 3</option>
                  <option value={4}>Năm 4</option>
                </select>
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

        {(editingProcessing || editingScheduledAt) && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setEditingProcessing(null);
              setEditingScheduledAt(null);
            }}
          />
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
                    Chia data
                  </button>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                  >
                    Xoá {selectedStudents.size} học viên
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
                  {[
                    { col: "year", label: "Năm", width: "w-16" },
                    { col: "mobileCarrier", label: "Nhà mạng", width: "w-28" },
                    { col: "clasification", label: "Phân Loại", width: "w-28" },
                    { col: "university", label: "Trường", width: "w-44" },
                    { col: "ownerUserId", label: "Sale Mới", width: "w-32" },
                    { col: "campaign", label: "Chiến dịch", width: "w-36" },
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
                            setFilterAnchorRect(
                              e.currentTarget.getBoundingClientRect(),
                            );
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
                    <button
                      type="button"
                      onClick={(e) => {
                        if (openFilterCol === "processingDate") {
                          setOpenFilterCol(null);
                          setFilterAnchorRect(null);
                        } else {
                          setOpenFilterCol("processingDate");
                          setFilterAnchorRect(e.currentTarget.getBoundingClientRect());
                        }
                      }}
                      className={`flex items-center gap-1.5 hover:text-indigo-600 transition ${filters.processingDate?.from || filters.processingDate?.to ? "text-indigo-600" : ""}`}
                    >
                      Ngày xử lý
                      {(filters.processingDate?.from || filters.processingDate?.to) && (
                        <span className="bg-indigo-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                          {(filters.processingDate?.from ? 1 : 0) + (filters.processingDate?.to ? 1 : 0)}
                        </span>
                      )}
                      <span className="text-xs opacity-50">▾</span>
                    </button>
                  </th>
                  {[
                    { col: "warm", label: "Làm Ấm", width: "w-36" },
                    { col: "call1", label: "Liên hệ Lần 1", width: "w-36" },
                    { col: "call2", label: "Liên hệ Lần 2", width: "w-36" },
                    { col: "call3", label: "Liên hệ Lần 3", width: "w-36" },
                  ].map(({ col, label, width }) => (
                    <th key={col} className={`${width} px-4 py-3 text-left font-semibold text-slate-600`}>
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
                  <th className="w-28 px-4 py-3 text-left font-semibold text-slate-600">
                    Đặt lịch
                  </th>
                  <th className="w-36 px-4 py-3 text-left font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={(e) => {
                        if (openFilterCol === "scheduledAt") {
                          setOpenFilterCol(null);
                          setFilterAnchorRect(null);
                        } else {
                          setOpenFilterCol("scheduledAt");
                          setFilterAnchorRect(
                            e.currentTarget.getBoundingClientRect(),
                          );
                        }
                      }}
                      className={`flex items-center gap-1.5 hover:text-indigo-600 transition ${filters.scheduledAt?.length ? "text-indigo-600" : ""}`}
                    >
                      Ngày hẹn
                      {filters.scheduledAt?.length > 0 && (
                        <span className="bg-indigo-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                          {filters.scheduledAt.length}
                        </span>
                      )}
                      <span className="text-xs opacity-50">▾</span>
                    </button>
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
                      colSpan={17}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={17}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Không tìm thấy học viên.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const classification =
                      classificationConfig[student.clasification || ""] ??
                      classificationConfig[""];
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
                        <td
                          className={`px-4 py-4 text-center sticky left-0 z-[1] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(
                              student.id || student._id,
                            )}
                            onChange={(e) => {
                              const sid = student.id || student._id;
                              if (
                                e.nativeEvent.shiftKey &&
                                lastSelectedIdx !== null
                              ) {
                                const start = Math.min(lastSelectedIdx, idx);
                                const end = Math.max(lastSelectedIdx, idx);
                                setSelectedStudents((prev) => {
                                  const next = new Set(prev);
                                  filteredStudents
                                    .slice(start, end + 1)
                                    .forEach((s) => next.add(s.id || s._id));
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
                        <td
                          className={`px-4 py-4 text-slate-800 font-medium sticky left-10 z-[1] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                        >
                          {student.name || "-"}
                        </td>
                        <td
                          className={`px-4 py-4 text-blue-500 whitespace-nowrap sticky left-[200px] z-[1] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)] ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                        >
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
                              value={student.clasification || ""}
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
                        <td className="px-4 py-4 text-slate-600">
                          {student.university || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {consultantName}
                        </td>
                        <td className="px-4 py-4">
                          {student.campaign ? (
                            <span className="rounded-full bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-0.5 text-xs font-semibold">
                              {student.campaign}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap relative">
                          {editingProcessing?.id ===
                          (student.id || student._id) ? (
                            <div
                              className="absolute z-30 top-1 left-1 bg-white border border-indigo-200 rounded-xl shadow-lg p-3 flex flex-col gap-2 min-w-[160px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="date"
                                value={editingProcessing.date}
                                onChange={(e) =>
                                  setEditingProcessing((p) => ({
                                    ...p,
                                    date: e.target.value,
                                  }))
                                }
                                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                              <div className="flex gap-1">
                                {[
                                  {
                                    v: "S",
                                    label: "Sáng",
                                    cls: "bg-amber-100 text-amber-600 border-amber-200",
                                  },
                                  {
                                    v: "C",
                                    label: "Chiều",
                                    cls: "bg-blue-100 text-blue-600 border-blue-200",
                                  },
                                  {
                                    v: "T",
                                    label: "Tối",
                                    cls: "bg-indigo-100 text-indigo-600 border-indigo-200",
                                  },
                                ].map(({ v, label, cls }) => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() =>
                                      setEditingProcessing((p) => ({
                                        ...p,
                                        shift: p.shift === v ? null : v,
                                      }))
                                    }
                                    className={`flex-1 rounded-lg border px-1 py-1 text-[11px] font-bold transition ${editingProcessing.shift === v ? cls : "bg-slate-50 text-slate-400 border-slate-200"}`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProcessing((p) => ({
                                    ...p,
                                    date: "",
                                    shift: null,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-50"
                              >
                                Để trống
                              </button>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingProcessing(null)}
                                  className="flex-1 rounded-lg border border-slate-200 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
                                >
                                  Huỷ
                                </button>
                                <button
                                  type="button"
                                  onClick={handleProcessingSave}
                                  className="flex-1 rounded-lg bg-indigo-600 py-1 text-[11px] font-bold text-white hover:bg-indigo-700"
                                >
                                  Lưu
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProcessing({
                                  id: student.id || student._id,
                                  date: student.processingDate
                                    ? toVNDateString(student.processingDate)
                                    : toVNDateString(new Date().toISOString()),
                                  shift: student.processingShift || null,
                                })
                              }
                              className="w-full text-left rounded-xl border border-transparent px-2 py-1.5 hover:border-slate-300 hover:bg-slate-50 transition"
                            >
                              {student.processingDate ? (
                                <span className="flex flex-col gap-0.5">
                                  <span className="text-xs font-semibold text-slate-700">
                                    {fmtDate(student.processingDate)}
                                  </span>
                                  {student.processingShift && (
                                    <span
                                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded w-fit ${
                                        student.processingShift === "S"
                                          ? "bg-amber-100 text-amber-600"
                                          : student.processingShift === "C"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-indigo-100 text-indigo-600"
                                      }`}
                                    >
                                      {
                                        { S: "Sáng", C: "Chiều", T: "Tối" }[
                                          student.processingShift
                                        ]
                                      }
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">
                                  —
                                </span>
                              )}
                            </button>
                          )}
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
                            + Đặt lịch
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap relative">
                          {editingScheduledAt?.id ===
                          (student.id || student._id) ? (
                            <div
                              className="absolute z-30 top-1 left-1 bg-white border border-indigo-200 rounded-xl shadow-lg p-3 flex flex-col gap-2 min-w-[170px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="date"
                                value={editingScheduledAt.date}
                                onChange={(e) =>
                                  setEditingScheduledAt((p) => ({
                                    ...p,
                                    date: e.target.value,
                                  }))
                                }
                                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={editingScheduledAt.hour}
                                  onChange={(e) =>
                                    setEditingScheduledAt((p) => ({
                                      ...p,
                                      hour: e.target.value,
                                    }))
                                  }
                                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                                >
                                  <option value="">--</option>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <option
                                      key={i}
                                      value={String(i).padStart(2, "0")}
                                    >
                                      {String(i).padStart(2, "0")}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-slate-400 font-bold text-xs">
                                  :
                                </span>
                                <select
                                  value={editingScheduledAt.minute}
                                  onChange={(e) =>
                                    setEditingScheduledAt((p) => ({
                                      ...p,
                                      minute: e.target.value,
                                    }))
                                  }
                                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                                >
                                  {["00", "15", "30", "45"].map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingScheduledAt((p) => ({
                                    ...p,
                                    date: "",
                                    hour: "",
                                    minute: "00",
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-200 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-50"
                              >
                                Để trống
                              </button>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingScheduledAt(null)}
                                  className="flex-1 rounded-lg border border-slate-200 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
                                >
                                  Huỷ
                                </button>
                                <button
                                  type="button"
                                  onClick={handleScheduledAtSave}
                                  className="flex-1 rounded-lg bg-indigo-600 py-1 text-[11px] font-bold text-white hover:bg-indigo-700"
                                >
                                  Lưu
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const raw = student.scheduledAt
                                  ? new Date(student.scheduledAt)
                                  : null;
                                setEditingScheduledAt({
                                  id: student.id || student._id,
                                  date: student.scheduledAt
                                    ? toVNDateString(student.scheduledAt)
                                    : "",
                                  hour: raw
                                    ? String(raw.getHours()).padStart(2, "0")
                                    : "",
                                  minute: raw
                                    ? String(
                                        Math.round(raw.getMinutes() / 15) * 15,
                                      ).padStart(2, "0")
                                    : "00",
                                });
                              }}
                              className="w-full text-left rounded-xl border border-transparent px-2 py-1.5 hover:border-indigo-200 hover:bg-indigo-50 transition"
                            >
                              {student.scheduledAt ? (
                                <span className="text-xs font-semibold text-indigo-600">
                                  {fmtDateTime(student.scheduledAt)}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">
                                  —
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <div
                            onClick={() => {
                              setEditingNoteId(student.id || student._id);
                              setNoteDraft(note === "-" ? "" : note);
                            }}
                            className="cursor-pointer rounded-2xl border border-transparent px-2 py-2 text-sm hover:border-slate-300 hover:bg-slate-50 transition break-words"
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
                <svg
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
            <p className="text-base font-bold text-slate-800 text-center">
              {assignResult.text}
            </p>
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
                <svg
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
            <p className="text-base font-bold text-slate-800 text-center">
              {scheduleResult.text}
            </p>
            <button
              type="button"
              onClick={() => {
                setScheduleResult(null);
                if (scheduleResult.type === "error") {
                  setPendingReload(false);
                  loadStudents();
                }
              }}
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
            <h2 className="text-base font-bold text-slate-900 mb-5">
              Đặt lịch hẹn
            </h2>
            <ScheduleForm
              date={scheduleModal.date}
              hour={scheduleModal.hour}
              minute={scheduleModal.minute}
              consultantId={scheduleModal.consultantId}
              users={users}
              onDateChange={(v) => setScheduleModal((p) => ({ ...p, date: v }))}
              onHourChange={(v) => setScheduleModal((p) => ({ ...p, hour: v }))}
              onMinuteChange={(v) =>
                setScheduleModal((p) => ({ ...p, minute: v }))
              }
              onConsultantChange={(v) =>
                setScheduleModal((p) => ({ ...p, consultantId: v }))
              }
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-900">
                Import học viên từ Excel
              </h2>
              <button
                type="button"
                onClick={() => {
                  const ws = XLSX.utils.aoa_to_sheet([
                    [
                      "name",
                      "phone",
                      "year",
                      "university",
                      "mobileCarrier",
                      "campaign",
                    ],
                    [
                      "Nguyễn Văn A",
                      "0987654321",
                      2005,
                      "UIT",
                      "viettel",
                      "Chiến dịch 2025",
                    ],
                  ]);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                  XLSX.writeFile(wb, "mau_import_hoc_vien.xlsx");
                }}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 text-xs font-semibold px-3 py-2 transition"
              >
                ⬇ Tải mẫu
              </button>
            </div>
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

      {importResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setImportResult(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-extrabold text-slate-800 text-base">
              Kết quả Import
            </h2>

            {(() => {
              const successList =
                importResult.successful ?? importResult.success ?? [];
              const failedList = importResult.failed ?? [];
              const allSuccess =
                successList.length > 0 && failedList.length === 0;
              return (
                <>
                  {allSuccess ? (
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-bold text-emerald-700 text-sm">
                          Import thành công!
                        </p>
                        <p className="text-xs text-emerald-600">
                          {importResult.message}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {importResult.message}
                    </p>
                  )}

                  {successList.length > 0 && !allSuccess && (
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                        Thành công ({successList.length})
                      </p>
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 divide-y divide-emerald-100">
                        {successList.map((r, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 text-xs text-emerald-700"
                          >
                            Dòng {r.row ?? r.rowNumber} —{" "}
                            {r.name ?? r.phone ?? ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {failedList.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
                        Thất bại ({failedList.length})
                      </p>
                      <div className="rounded-xl bg-red-50 border border-red-200 divide-y divide-red-100">
                        {failedList.map((r, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 text-xs text-red-600"
                          >
                            Dòng {r.row ?? r.rowNumber} — {r.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setImportResult(null)}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition ${allSuccess ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
                  >
                    Đóng
                  </button>
                </>
              );
            })()}
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

      {deleteConfirm && (
        <ConfirmModal
          title="Xoá học viên"
          description={`Bạn chắc chắn muốn xoá ${selectedStudents.size} học viên đã chọn? Hành động này không thể hoàn tác.`}
          confirmLabel="Xoá"
          onConfirm={executeBulkDelete}
          onCancel={() => setDeleteConfirm(false)}
          danger
        />
      )}

      {createResult && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          onClick={() => setCreateResult(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 py-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${createResult.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}
              >
                {createResult.type === "success" ? "✓" : "✕"}
              </div>
              <p
                className={`font-bold text-base text-center ${createResult.type === "success" ? "text-emerald-600" : "text-red-500"}`}
              >
                {createResult.message}
              </p>
            </div>
            <button
              onClick={() => setCreateResult(null)}
              className={`w-full rounded-xl py-2.5 text-sm font-bold text-white transition ${createResult.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {deleteResult && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
          onClick={() => setDeleteResult(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 py-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${deleteResult.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}
              >
                {deleteResult.type === "success" ? "✓" : "✕"}
              </div>
              <p
                className={`font-bold text-base text-center ${deleteResult.type === "success" ? "text-emerald-600" : "text-red-500"}`}
              >
                {deleteResult.message}
              </p>
            </div>
            <button
              onClick={() => setDeleteResult(null)}
              className={`w-full rounded-xl py-2.5 text-sm font-bold text-white transition ${deleteResult.type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
