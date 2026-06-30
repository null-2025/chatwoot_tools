import { useState, useEffect } from "react";

export function useProxy() {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    let interval;
    const checkStatus = async () => {
      try {
        const res = await fetch("http://localhost:8765/status");
        if (res.ok) {
          const data = await res.json();
          if (data.status === "connected") {
            setIsConnected(true);
            setAccountId(data.accountId);
            return;
          }
        }
        setIsConnected(false);
        setAccountId(null);
      } catch (e) {
        setIsConnected(false);
        setAccountId(null);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return { isConnected, accountId };
}
