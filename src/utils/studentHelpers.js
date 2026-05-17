import { STEP_CONFIG } from "../constants/studentConfig";
import { fmtDateTime, toVNInputValue } from "./dateHelpers";

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

export const formatStepInputValue = toVNInputValue;
