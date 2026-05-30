export const classificationConfig = {
  "": {
    label: "CHƯA PHÂN LOẠI",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  TRUNG_TAM_KHAC: {
    label: "TRUNG TÂM KHÁC",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  MUON_TIM_HIEU_KHOA: {
    label: "MUỐN TÌM HIỂU KHOÁ",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  CO_CHUNG_CHI_ROI: {
    label: "CÓ CHỨNG CHỈ RỒI",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  CAN_HOC_LUOI: {
    label: "CẦN HỌC - LƯỜI",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  CAN_HOC_TAI_CHINH: {
    label: "CẦN HỌC - TÀI CHÍNH",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export const statusConfig = {
  OTHER: {
    label: "TRỐNG",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  NOT_ARRIVED: {
    label: "CHƯA ĐẾN",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },

  ARRIVED: {
    label: "ĐÃ ĐẾN",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  REGISTERED: {
    label: "ĐÃ ĐĂNG KÝ",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  CANCELLED: {
    label: "ĐÃ HỦY",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export const LEARNING_MODE_CONFIG = {
  offline: {
    label: "Offline",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  online: {
    label: "Online",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

export const MOBILE_CARRIER_OPTIONS = [
  { value: "viettel", label: "Viettel" },
  { value: "mobifone", label: "Mobifone" },
  { value: "vinaphone", label: "Vinaphone" },
  { value: "vietnamobile", label: "Vietnamobile" },
  { value: "other", label: "Khác" },
];

export const GOI_CHOT_RESULT_OPTIONS = [
  { value: "OTHER",      label: "-",           className: "bg-slate-100 text-slate-500 border-slate-200" },
  { value: "NHIET_TINH", label: "Nhiệt tình",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "HO_HUNG",    label: "Hờ hững",     className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "KNM",        label: "Không nghe máy", className: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "TU_CHOI",    label: "Từ chối",     className: "bg-red-100 text-red-700 border-red-200" },
  { value: "DOI_LICH",   label: "Đổi lịch",   className: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "SAI_SO",     label: "Sai số",      className: "bg-slate-100 text-slate-500 border-slate-200" },
];

const CALL_RESULT_OPTIONS = [
  {
    value: "null",
    label: "-",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  {
    value: "KNM",
    label: "Không nghe máy",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "KNM1",
    label: "KNM lần 1",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "KNM2",
    label: "KNM lần 2",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "KNM3",
    label: "KNM lần 3",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "GLS",
    label: "Gọi lại sau",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "TU_CHOI",
    label: "Từ chối",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "DONG_Y",
    label: "Đồng ý",
    className: "bg-yellow-500 text-black border-yellow-200",
  },
  {
    value: "DAP_MAY",
    label: "Đập máy",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  {
    value: "TREO_MAY",
    label: "Treo máy",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  {
    value: "THUE_BAO",
    label: "Thuê bao",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "TIEU_CUC",
    label: "Tiêu cực",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "PHU_HUYNH",
    label: "Phụ huynh",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    value: "SAI_SO",
    label: "Sai số",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
];

export const STEP_CONFIG = {
  warm: {
    label: "Làm ấm",
    resultOptions: [
      { value: "null", label: "-" },
      { value: "rep_nhiet_tinh", label: "Rep nhiệt tình" },
      { value: "rep_ho_hung", label: "Rep hờ hững" },
      { value: "không_rep", label: "Không rep" },
    ],
    hasNote: true,
  },
  call1: {
    label: "Liên hệ lần 1",
    resultOptions: CALL_RESULT_OPTIONS,
    hasNote: true,
  },
  call2: {
    label: "Liên hệ lần 2",
    resultOptions: CALL_RESULT_OPTIONS,
    hasNote: true,
  },
  call3: {
    label: "Liên hệ lần 3",
    resultOptions: CALL_RESULT_OPTIONS,
    hasNote: true,
  },
};

export const ROLE_CONFIG = {
  sale: {
    label: "Sale",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  consultant: {
    label: "Tư vấn",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  admin: {
    label: "Quản lý",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export const ROLE_LABELS = Object.fromEntries(
  Object.entries(ROLE_CONFIG).map(([k, v]) => [k, v.label]),
);

export const ROLE_OPTIONS = Object.keys(ROLE_CONFIG);

export const APPOINTMENT_STATUS = {
  ...statusConfig,
  CANCELLED: {
    label: "ĐÃ HUỶ",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export const TRANG_THAI = {
  chua_nop: {
    label: "Chưa nộp",
    cls: "border-amber-200 bg-amber-50 text-amber-600",
  },
  da_nop: {
    label: "Đã nộp",
    cls: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
};

export const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));
