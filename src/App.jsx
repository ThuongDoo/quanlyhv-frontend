import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import ServerError from "./pages/ServerError";

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

  if (offlineType) {
    return <ServerError type={offlineType} onRetry={() => setOfflineType(null)} />;
  }

  return <RouterProvider router={router} />;
}

export default App;
