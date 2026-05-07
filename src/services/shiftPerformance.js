import api from "./api";

export const shiftPerformanceApi = {
  create(payload) {
    return api.post("/shift-performances", payload);
  },
  getByDate(date) {
    return api.get("/shift-performances", { params: { date } });
  },
  getReportMonth(month, year) {
    return api.get("/shift-performances/report/month", { params: { month, year } });
  },
  getReportWeek(date) {
    return api.get("/shift-performances/report/week", { params: { date } });
  },
};
