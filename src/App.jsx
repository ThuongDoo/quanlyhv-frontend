import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import ServerError from "./pages/ServerError";
import { ToastProvider } from "./components/ToastContainer";

function App() {
  const [offlineType, setOfflineType] = useState(null); // "network" | "server" | null

  useEffect(() => {
    const handleOffline = (e) => setOfflineType(e.detail?.type ?? "server");
    const handleOnline = () => setOfflineType(null);

    window.addEventListener("server:offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("server:offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <ToastProvider>
      {offlineType ? (
        <ServerError type={offlineType} onRetry={() => setOfflineType(null)} />
      ) : (
        <RouterProvider router={router} />
      )}
    </ToastProvider>
  );
}

export default App;
