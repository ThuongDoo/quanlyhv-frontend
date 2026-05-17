const VN_TZ = "Asia/Ho_Chi_Minh";

export function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: VN_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: VN_TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return "—";
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
