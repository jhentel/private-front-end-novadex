import {
  useState,
  useCallback,
  useEffect,
} from "react";

export function useNetworkHealth() {
  const [isNetworkHealthy, setIsNetworkHealthy] = useState(true);

  // NETWORK STATUS
  const handleOnline = useCallback(() => {
    /* console.log("WS HOOK 📺 | HANDLE ONLINE ✅") */;
    setIsNetworkHealthy(true);
  }, []);

  const handleOffline = useCallback(() => {
    /* console.log("WS HOOK 📺 | HANDLE OFFLINE ✅") */;
    setIsNetworkHealthy(false);
  }, []);

  useEffect(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [handleOnline, handleOffline]);

  return isNetworkHealthy;
}
