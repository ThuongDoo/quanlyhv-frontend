import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import ShiftPerformance from "../pages/ShiftPerformance";
import History from "../pages/History";
import ReportMonth from "../pages/ReportMonth";
import ReportWeek from "../pages/ReportWeek";
import NhanSu from "../pages/NhanSu";
import QuyHocTap from "../pages/QuyHocTap";
import TaiNguyen from "../pages/TaiNguyen";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import { RequireAuth } from "../components/RequireAuth";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/students", element: <Students /> },
      { path: "/performance", element: <ShiftPerformance /> },
      { path: "/history", element: <History /> },
      { path: "/report-month", element: <ReportMonth /> },
      { path: "/report-week", element: <ReportWeek /> },
      { path: "/nhan-su", element: <NhanSu /> },
      { path: "/quy-hoc-tap", element: <QuyHocTap /> },
      { path: "/tai-nguyen", element: <TaiNguyen /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
