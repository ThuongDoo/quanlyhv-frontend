import api from "./api";

export const resourceApi = {
  getAll(search) {
    return api.get("/resources", { params: search ? { search } : {} });
  },
  create(payload) {
    return api.post("/resources", payload);
  },
  update(id, payload) {
    return api.put(`/resources/${id}`, payload);
  },
  remove(id) {
    return api.delete(`/resources/${id}`);
  },
};

export const meetingMinutesApi = {
  getAll(params) {
    return api.get("/meeting-minutes", { params });
  },
  create(payload) {
    return api.post("/meeting-minutes", payload);
  },
  update(id, payload) {
    return api.put(`/meeting-minutes/${id}`, payload);
  },
  remove(id) {
    return api.delete(`/meeting-minutes/${id}`);
  },
};
