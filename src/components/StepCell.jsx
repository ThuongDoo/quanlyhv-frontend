import { useEffect, useRef } from "react";
import { STEP_CONFIG } from "../constants/studentConfig";
import {
  getStep,
  formatStepSummary,
  formatStepInputValue,
} from "../utils/studentHelpers";

function StepBadge({ student, stepKey }) {
  const config = STEP_CONFIG[stepKey];
  const step = getStep(student, stepKey);
  const result = step?.data?.result;
  const option = config?.resultOptions?.find((o) => o.value === result);
  const label = formatStepSummary(student, stepKey);

  if (label === "-") return <span className="text-slate-300 text-xs">—</span>;

  if (option?.className) {
    const note = step?.data?.note ? ` • ${step.data.note}` : "";
    return (
      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${option.className}`}>
        {option.label}{note}
      </span>
    );
  }

  return <span className="text-sm text-slate-700 break-words">{label}</span>;
}

export default function StepCell({
  student,
  stepKey,
  editingStep,
  onEditingChange,
  onStepChange,
}) {
  const selectRef = useRef(null);
  const studentId = student.id || student._id;
  const editingKey = `${studentId}-${stepKey}`;
  const config = STEP_CONFIG[stepKey];
  const step = getStep(student, stepKey);
  const currentValue = config?.dateField
    ? formatStepInputValue(step?.data?.[config.dateField])
    : step?.data?.result || "";

  const isEditing = editingStep === editingKey;

  useEffect(() => {
    if (isEditing && selectRef.current && config?.resultOptions) {
      selectRef.current.focus();
      selectRef.current.click();
    }
  }, [isEditing, config?.resultOptions]);

  if (isEditing) {
    if (config?.dateField) {
      return (
        <input
          type="datetime-local"
          value={currentValue}
          onChange={(e) => onStepChange(studentId, stepKey, e.target.value)}
          onBlur={() => onEditingChange(null)}
          autoFocus
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      );
    }

    return (
      <select
        ref={selectRef}
        value={currentValue}
        onChange={(e) => onStepChange(studentId, stepKey, e.target.value)}
        onBlur={() => onEditingChange(null)}
        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        {config?.resultOptions?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onEditingChange(editingKey)}
      className="w-full text-left rounded-2xl border border-transparent px-2 py-2 hover:border-slate-300 hover:bg-slate-50"
    >
      <StepBadge student={student} stepKey={stepKey} />
    </button>
  );
}
