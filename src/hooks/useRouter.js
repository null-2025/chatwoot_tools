import { useState, useEffect } from "react";

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(
    () => window.location.pathname,
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setCurrentPath(to);
  };

  return {
    currentPath,
    setCurrentPath,
    navigate,
  };
}
