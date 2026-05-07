import api from "./api";

export const authApi = {
  login(credentials) {
    return api.post("/auth/login", credentials);
  },

  register(data) {
    return api.post("/auth/register", data);
  },

  forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },

  resetPassword(payload) {
    return api.post("/auth/reset-password", payload);
  },

  changePassword(payload) {
    return api.post("/auth/change-password", payload);
  },

  fetchUsers() {
    return api.get("/auth/users");
  },

  updateUser(userId, payload) {
    return api.put(`/auth/users/${userId}`, payload);
  },
  deleteUser(userId) {
    return api.delete(`/auth/users/${userId}`);
  },
};
