import api from "./api";

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const shiftPerformanceApi = {
  create(payload) {
    return api.post("/shift-performances", payload);
  },
  getByDate(date, userId) {
    const params = { date, timezone: tz() };
    if (userId) params.userId = userId;
    return api.get("/shift-performances", { params });
  },
  getReportMonth(month, year, userId) {
    const params = { month, year, timezone: tz() };
    if (userId) params.userId = userId;
    return api.get("/shift-performances/report/month", { params });
  },
  getReportWeek(date, userId) {
    const params = { date, timezone: tz() };
    if (userId) params.userId = userId;
    return api.get("/shift-performances/report/week", { params });
  },
};
