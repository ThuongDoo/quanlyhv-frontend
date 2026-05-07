export const SHIFTS = [
  { value: "S", label: "Sáng", startHour: 8, endHour: 14 },
  { value: "C", label: "Chiều", startHour: 14, endHour: 19 },
  { value: "T", label: "Tối", startHour: 19, endHour: 24 },
];

export function getCurrentShift() {
  const hour = new Date().getHours();
  const match = SHIFTS.find((s) => hour >= s.startHour && hour < s.endHour);
  return match ? match.value : SHIFTS[0].value;
}

export function getTodayString() {
  return new Date().toISOString().split("T")[0];
}
