import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Login from "../pages/Login";
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
      { path: "/performance", element: <Students /> },
      { path: "/history", element: <Students /> },
      { path: "/report-month", element: <Students /> },
      { path: "/report-week", element: <Students /> },
    ],
  },
]);
