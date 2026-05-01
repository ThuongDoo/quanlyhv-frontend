import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
