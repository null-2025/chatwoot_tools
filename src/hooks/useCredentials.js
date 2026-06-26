import { useState, useEffect } from "react";

export function useCredentials() {
  const [accountId, setAccountId] = useState(
    () => localStorage.getItem("chatwoot_account_id") || "",
  );
  const [apiToken, setApiToken] = useState(
    () => localStorage.getItem("chatwoot_api_token") || "",
  );

  useEffect(() => {
    localStorage.setItem("chatwoot_account_id", accountId);
  }, [accountId]);

  useEffect(() => {
    localStorage.setItem("chatwoot_api_token", apiToken);
  }, [apiToken]);

  const isLoggedIn = accountId.trim() !== "" && apiToken.trim() !== "";

  return {
    accountId,
    setAccountId,
    apiToken,
    setApiToken,
    isLoggedIn,
  };
}
