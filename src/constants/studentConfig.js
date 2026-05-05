export const classificationConfig = {
  0: {
    label: "CHƯA PHÂN LOẠI",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  1: {
    label: "LOẠI 1: ƯU TIÊN",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  2: {
    label: "LOẠI 2: ĐANG CÂN NHẮC",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  3: {
    label: "LOẠI 3: KHÓ",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export const statusConfig = {
  active: {
    label: "CHƯA ĐẾN",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  lost: {
    label: "TỪ CHỐI",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  enrolled: {
    label: "ĐÃ ĐẾN",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  registered: {
    label: "ĐÃ ĐĂNG KÝ",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

export const STEP_CONFIG = {
  warm: {
    label: "Làm ấm",
    resultOptions: [
      { value: "null", label: "-" },
      { value: "da_xem", label: "Đã xem" },
      { value: "da_tra_loi", label: "Đã trả lời" },
      { value: "khong_phan_hoi", label: "Không phản hồi" },
    ],
    hasNote: true,
  },
  call1: {
    label: "Liên hệ lần 1",
    resultOptions: [
      { value: "null", label: "-" },
      { value: "nhiet_tinh", label: "Nhiệt tình" },
      { value: "binh_thuong", label: "Bình thường" },
      { value: "tu_choi", label: "Từ chối" },
    ],
    hasNote: true,
  },
  call2: {
    label: "Liên hệ lần 2",
    resultOptions: [
      { value: "null", label: "-" },
      { value: "hen_goi_lai", label: "Hẹn gọi lại" },
      { value: "khong_nghe_may", label: "Không nghe máy" },
      { value: "tu_choi", label: "Từ chối" },
    ],
    hasNote: true,
  },
  call3: {
    label: "Liên hệ lần 3",
    resultOptions: [
      { value: "null", label: "-" },

      { value: "hen_goi_lai", label: "Hẹn gọi lại" },
      { value: "khong_nghe_may", label: "Không nghe máy" },
      { value: "tu_choi", label: "Từ chối" },
    ],
    hasNote: true,
  },
};
