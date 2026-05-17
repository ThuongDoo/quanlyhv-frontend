import api from "./api";

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const shiftPerformanceApi = {
  create(payload) {
    return api.post("/shift-performances", payload);
  },
  getByDate(date) {
    return api.get("/shift-performances", { params: { date, timezone: tz() } });
  },
  getReportMonth(month, year) {
    return api.get("/shift-performances/report/month", { params: { month, year, timezone: tz() } });
  },
  getReportWeek(date) {
    return api.get("/shift-performances/report/week", { params: { date, timezone: tz() } });
  },
};
