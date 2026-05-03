import { useCallback, useEffect, useMemo, useState } from "react";
import { studentApi } from "../services/students";
import { authApi } from "../services/auth";
import { getUser } from "../hooks/useAuth";
import StepCell from "../components/StepCell";
import FilterDropdown from "../components/FilterDropdown";
import {
  classificationConfig,
  statusConfig,
  STEP_CONFIG,
} from "../constants/studentConfig";
import {
  formatStepSummary,
  formatStepInputValue,
  getStep,
} from "../utils/studentHelpers";

export default function Students() {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(80);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 80,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importMessage, setImportMessage] = useState("");
  const [editingClassification, setEditingClassification] = useState(null);
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
  const [appointmentModal, setAppointmentModal] = useState({
    open: false,
    studentId: null,
    date: "",
    time: "",
    consultant: "",
  });
  const [filters, setFilters] = useState({});
  const [openFilterCol, setOpenFilterCol] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    year: new Date().getFullYear(),
    mobileCarrier: "",
    university: "",
  });

  console.log(students);

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
      mobileCarrier: unique(students.map((s) => s.mobileCarrier)).map((v) => ({ value: v, label: v })),
      clasification: Object.entries(classificationConfig).map(([value, cfg]) => ({ value, label: cfg.label })),
      university: unique(students.map((s) => s.university)).map((v) => ({ value: v, label: v })),
      ownerUserId: unique(students.map((s) => s.ownerUserId)).map((id) => {
        const u = users.find((x) => (x._id || x.id) === id);
        return { value: id, label: u?.name || u?.username || id };
      }),
      consultant: users.map((u) => ({ value: u._id || u.id, label: u.name || u.username || u.email })),
      status: Object.entries(statusConfig).map(([value, cfg]) => ({ value, label: cfg.label })),
      currentStepKey: Object.entries(STEP_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label })),
    };
  }, [students, users]);

  // Only clasification is filtered client-side (backend doesn't support it).
  // All other filters are sent as query params to the API.
  const filteredStudents = useMemo(() => {
    if (!filters.clasification?.length) return students;
    return students.filter((s) => filters.clasification.includes(s.clasification || "0"));
  }, [students, filters.clasification]);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, search };
      if (filters.mobileCarrier?.length) params.mobileCarrier = filters.mobileCarrier;
      if (filters.university?.length) params.university = filters.university;
      if (filters.ownerUserId?.length) params.ownerUserId = filters.ownerUserId;
      if (filters.consultant?.length) params.consultant = filters.consultant;
      if (filters.status?.length) params.status = filters.status;
      if (filters.currentStepKey?.length) params.currentStepKey = filters.currentStepKey[0];
      const response = await studentApi.fetchStudents(params);

      setStudents(response.students || []);
      setPagination(response.pagination || { page, limit, total: 0, pages: 1 });
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

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

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
      console.log(" send data");

      const response = await studentApi.importStudents(importFile);
      console.log("complete");

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
      loadStudents();
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
      loadStudents();
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
      const allIds = new Set(students.map((s) => s.id || s._id));
      setSelectedStudents(allIds);
    } else {
      setSelectedStudents(new Set());
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
      setAssignMessage(
        `${result.stats.modified} học viên đã được gán thành công.`,
      );
      setSelectedStudents(new Set());
      setAssignUserId("");
      loadStudents();
      setTimeout(() => {
        setShowAssignPanel(false);
        setAssignMessage("");
      }, 2000);
    } catch (err) {
      setAssignMessage(
        err?.response?.data?.error || err?.message || "Không thể gán học viên.",
      );
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
        const updatedSteps = Array.isArray(student.steps)
          ? student.steps.map((step) =>
              step.key === key
                ? {
                    ...step,
                    data: {
                      ...step.data,
                      ...(config?.dateField
                        ? { [config.dateField]: value }
                        : { result: value }),
                    },
                  }
                : step,
            )
          : {
              ...student.steps,
              [key]: {
                ...student.steps[key],
                data: {
                  ...student.steps[key].data,
                  ...(config?.dateField
                    ? { [config.dateField]: value }
                    : { result: value }),
                },
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
      loadStudents();
    }
  };

  const openAppointmentModal = (student) => {
    const sid = student.id || student._id;
    const step = getStep(student, "apointment");
    const formatted = formatStepInputValue(step?.data?.scheduledAt);
    const [date, time] = formatted ? formatted.split("T") : ["", ""];
    setAppointmentModal({
      open: true,
      studentId: sid,
      date: date || "",
      time: time || "",
      consultant: step?.data?.consultant || "",
    });
  };

  const handleAppointmentSave = async () => {
    const { studentId, date, time, consultant } = appointmentModal;
    const scheduledAt = date ? `${date}T${time || "00:00"}` : null;

    setStudents((prev) =>
      prev.map((s) => {
        if ((s.id || s._id) !== studentId) return s;
        const updatedSteps = Array.isArray(s.steps)
          ? s.steps.map((step) =>
              step.key === "apointment"
                ? { ...step, data: { ...step.data, scheduledAt, consultant } }
                : step,
            )
          : {
              ...s.steps,
              apointment: {
                ...s.steps?.apointment,
                data: { ...s.steps?.apointment?.data, scheduledAt, consultant },
              },
            };
        return { ...s, steps: updatedSteps };
      }),
    );
    setAppointmentModal({ open: false, studentId: null, date: "", time: "", consultant: "" });
    try {
      await studentApi.updateStep(studentId, {
        key: "apointment",
        isDone: true,
        data: { scheduledAt, consultant },
      });
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Không thể cập nhật lịch hẹn.",
      );
      loadStudents();
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

  const totalPages = pagination.pages || 1;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg tracking-tight">
              Danh sách học viên
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Đồng bộ lúc:{" "}
              <span className="text-blue-500 font-semibold">{timeStr}</span>
            </p>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
            {pagination.total || students.length} Leads
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm tên, SĐT hoặc năm..."
              value={search}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-64 transition"
            />
          </div>
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
        <div className="fixed inset-0 z-20" onClick={() => setOpenFilterCol(null)} />
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bước hiện tại:</span>
          {[{ value: "", label: "Tất cả" }, ...Object.entries(STEP_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))].map(({ value, label }) => {
            const active = value === (filters.currentStepKey?.[0] || "");
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, currentStepKey: value ? [value] : [] }));
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"}`}
              >
                {label}
              </button>
            );
          })}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => { setFilters({}); setPage(1); }}
              className="ml-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-100 transition"
            >
              Xóa tất cả ({activeFilterCount})
            </button>
          )}
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

        {showImportPanel && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Import học viên từ Excel
            </h2>
            <form
              onSubmit={handleImportSubmit}
              className="grid gap-4 lg:grid-cols-[1fr_auto] items-end"
            >
              <label className="space-y-2 text-sm text-slate-700">
                Chọn file Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Nhập file
              </button>
              {importMessage && (
                <div className="lg:col-span-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {importMessage}
                </div>
              )}
            </form>
          </div>
        )}

        {showAssignPanel && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Gán {selectedStudents.size} học viên cho người dùng
            </h2>
            <form
              onSubmit={handleAssignSubmit}
              className="grid gap-4 lg:grid-cols-[1fr_auto_auto] items-end"
            >
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
              <button
                type="submit"
                disabled={assignLoading}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {assignLoading ? "Đang gán..." : "Gán ngay"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAssignPanel(false);
                  setAssignMessage("");
                }}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              {assignMessage && (
                <div className="lg:col-span-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {assignMessage}
                </div>
              )}
            </form>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-center">
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
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Họ Tên
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    SĐT
                  </th>
                  {[
                    { col: "mobileCarrier", label: "Nhà mạng" },
                    { col: "clasification", label: "Phân Loại" },
                    { col: "university", label: "Trường" },
                    { col: "ownerUserId", label: "Sale Mới" },
                  ].map(({ col, label }) => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-slate-600 relative">
                      <button
                        type="button"
                        onClick={() => setOpenFilterCol(openFilterCol === col ? null : col)}
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
                      {openFilterCol === col && (
                        <FilterDropdown
                          options={filterOptions[col] || []}
                          selected={filters[col] || []}
                          onToggle={(value) => toggleFilter(col, value)}
                          onClear={() => clearFilter(col)}
                        />
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Làm Ấm
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Liên hệ Lần 1
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Liên hệ Lần 2
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Ngày Giờ Hẹn Đến
                  </th>
                  {[
                    { col: "consultant", label: "Tư Vấn Viên" },
                    { col: "status", label: "Đã Đến" },
                  ].map(({ col, label }) => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-slate-600 relative">
                      <button
                        type="button"
                        onClick={() => setOpenFilterCol(openFilterCol === col ? null : col)}
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
                      {openFilterCol === col && (
                        <FilterDropdown
                          options={filterOptions[col] || []}
                          selected={filters[col] || []}
                          onToggle={(value) => toggleFilter(col, value)}
                          onClear={() => clearFilter(col)}
                        />
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Note Vấn đề
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Đang tải danh sách...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Không tìm thấy học viên.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const classification =
                      classificationConfig[student.clasification || "0"];
                    const status = statusConfig[student.status || "active"];
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
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(
                              student.id || student._id,
                            )}
                            onChange={() =>
                              handleToggleStudentSelection(
                                student.id || student._id,
                              )
                            }
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="px-4 py-4 text-slate-800 font-medium whitespace-nowrap">
                          {student.name || "-"}
                        </td>
                        <td className="px-4 py-4 text-blue-500 whitespace-nowrap">
                          {student.phone || "-"}
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
                                setTimeout(() => e.currentTarget.click(), 0);
                              }}
                              autoFocus
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                              <option value="0">Chưa phân loại</option>
                              <option value="1">Loại 1</option>
                              <option value="2">Loại 2</option>
                              <option value="3">Loại 3</option>
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
                          <button
                            type="button"
                            onClick={() => openAppointmentModal(student)}
                            className="w-full text-left rounded-2xl border border-transparent px-2 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          >
                            {formatStepSummary(student, "apointment")}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                          {(() => {
                            const apStep = getStep(student, "apointment");
                            const cId = apStep?.data?.consultant;
                            const cUser = users.find((u) => (u._id || u.id) === cId);
                            return cUser?.name || cUser?.username || "-";
                          })()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700 max-w-xs">
                          {editingNoteId === (student.id || student._id) ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                rows={4}
                                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                placeholder="Nhập note vấn đề..."
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleNoteSave(student.id || student._id)
                                  }
                                  className="rounded-2xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setNoteDraft("");
                                  }}
                                  className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNoteId(student.id || student._id);
                                setNoteDraft(note === "-" ? "" : note);
                              }}
                              className="cursor-pointer max-w-xs overflow-hidden text-ellipsis whitespace-pre-line rounded-2xl border border-transparent px-2 py-2 hover:border-slate-300 hover:bg-slate-50"
                            >
                              {note || "-"}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-between md:flex-row md:items-center">
          <div className="text-sm text-slate-500">
            Tổng:{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total || 0}
            </span>{" "}
            học viên
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-sm text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
              className="rounded-2xl border border-indigo-300 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setError("")}
        >
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
              onClick={() => setError("")}
              className="mt-5 w-full rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {appointmentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-bold text-slate-900 mb-5">
              Đặt lịch hẹn
            </h2>
            <div className="space-y-4">
              <label className="block space-y-2 text-sm text-slate-700">
                Ngày hẹn
                <input
                  type="date"
                  value={appointmentModal.date}
                  onChange={(e) =>
                    setAppointmentModal((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-700">
                Giờ hẹn
                <input
                  type="time"
                  value={appointmentModal.time}
                  onChange={(e) =>
                    setAppointmentModal((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-700">
                Tư vấn viên
                <select
                  value={appointmentModal.consultant}
                  onChange={(e) =>
                    setAppointmentModal((prev) => ({ ...prev, consultant: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  <option value="">-- Chọn tư vấn viên --</option>
                  {users.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name || u.username || u.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleAppointmentSave}
                className="flex-1 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() =>
                  setAppointmentModal({ open: false, studentId: null, date: "", time: "", consultant: "" })
                }
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
