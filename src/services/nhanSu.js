import api from "./api";

export const penaltyApi = {
  getAll(params) {
    return api.get("/penalties", { params });
  },
  create(payload) {
    return api.post("/penalties", payload);
  },
  update(id, payload) {
    return api.put(`/penalties/${id}`, payload);
  },
  updateTrangThai(id, trangThai) {
    return api.patch(`/penalties/${id}/trang-thai`, { trangThai });
  },
  remove(id) {
    return api.delete(`/penalties/${id}`);
  },
};
