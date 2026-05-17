import api from "./api";

export const appointmentApi = {
  getAll(params) {
    return api.get("/appointments", { params });
  },
  update(id, payload) {
    return api.put(`/appointments/${id}`, payload);
  },
  create(payload) {
    return api.post("/appointments", payload);
  },
  remove(id) {
    return api.delete(`/appointments/${id}`);
  },
};
