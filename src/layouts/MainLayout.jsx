import { Outlet } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar";
import ErrorBoundary from "../components/ErrorBoundary";

export default function MainLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 min-h-0 overflow-hidden">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
