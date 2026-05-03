import { useEffect, useRef } from "react";
import { STEP_CONFIG } from "../constants/studentConfig";
import {
  getStep,
  formatStepSummary,
  formatStepInputValue,
} from "../utils/studentHelpers";

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
        <option value="">Chọn kết quả</option>
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
      className="w-full text-left rounded-2xl border border-transparent px-2 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50"
    >
      {formatStepSummary(student, stepKey)}
    </button>
  );
}
