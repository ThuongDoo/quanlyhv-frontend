const VN_TZ = "Asia/Ho_Chi_Minh";

export function fmtDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: VN_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).formatToParts(d);
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("day")}/${get("month")}/${get("year")}`;
  } catch {
    return "—";
  }
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: VN_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;
  } catch {
    return "—";
  }
}

// Extract { date, hour, minute } theo múi giờ VN, dùng cho form edit lịch hẹn
export function toVNTimeParts(iso) {
  if (!iso) return { date: "", hour: "", minute: "00" };
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: VN_TZ,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date(iso));
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    return {
      date: `${get("year")}-${get("month")}-${get("day")}`,
      hour: get("hour"),
      minute: get("minute"),
    };
  } catch {
    return { date: "", hour: "", minute: "00" };
  }
}

// Chuyển ISO sang "YYYY-MM-DD" theo múi giờ VN, dùng cho input type="date"
export function toVNDateString(iso) {
  if (!iso) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: VN_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(iso));
    const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch {
    return "";
  }
}

// Chuyển ISO UTC sang chuỗi "YYYY-MM-DDTHH:mm" theo UTC+7, dùng cho input datetime-local
export function toVNInputValue(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
    const vnTime = new Date(d.getTime() + VN_OFFSET_MS);
    return vnTime.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}
