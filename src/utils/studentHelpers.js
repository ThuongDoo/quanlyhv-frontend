import { STEP_CONFIG } from "../constants/studentConfig";
import { fmtDateTime } from "./dateHelpers";

export function getStep(student, key) {
  if (!student?.steps) return null;
  return Array.isArray(student.steps)
    ? student.steps.find((item) => item.key === key)
    : student.steps[key];
}

export const formatDate = (value) => {
  if (!value) return "-";
  try { return fmtDateTime(value); }
  catch { return "-"; }
};

export const formatStepSummary = (student, key) => {
  const step = getStep(student, key);
  if (!step?.data) return "-";

  const config = STEP_CONFIG[key];
  if (!config) return "-";
  const data = step.data || {};

  if (key === "apointment") {
    return data.scheduledAt ? formatDate(data.scheduledAt) : "Chưa đặt lịch";
  }

  const resultLabel = config.resultOptions?.find(
    (option) => option.value === data.result,
  )?.label;
  const noteLabel = data.note ? ` • ${data.note}` : "";

  return resultLabel ? `${resultLabel}${noteLabel}` : "-";
};

export const formatStepInputValue = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  } catch {
    return "";
  }
};
