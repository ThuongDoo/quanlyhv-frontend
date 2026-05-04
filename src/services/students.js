import api from "./api";

export const studentApi = {
  fetchStudents(params = {}) {
    return api.get("/students", { params });
  },

  fetchUniversities() {
    return api.get("/students/universities");
  },

  fetchStudent(studentId) {
    return api.get(`/students/${studentId}`);
  },

  createStudent(payload) {
    return api.post("/students", payload);
  },

  updateStudent(studentId, payload) {
    return api.put(`/students/${studentId}`, payload);
  },

  updateStep(studentId, payload) {
    return api.patch(`/students/${studentId}/step`, payload);
  },

  scheduleStudent(studentId, payload) {
    return api.patch(`/students/${studentId}/schedule`, payload);
  },

  deleteStep(studentId, stepKey) {
    return api.delete(`/students/${studentId}/step/${stepKey}`);
  },

  deleteStudent(studentId) {
    return api.delete(`/students/${studentId}`);
  },

  importStudents(file) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/students/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  assignStudentToUser(studentIds, ownerUserId) {
    return api.patch("/students/assign", { studentIds, ownerUserId });
  },
};
