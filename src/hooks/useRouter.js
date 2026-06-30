import { useState, useEffect } from "react";

function getPathWithoutBase(path) {
  const base = import.meta.env.BASE_URL || "/";
  if (path.startsWith(base)) {
    return "/" + path.slice(base.length).replace(/^\/+/, "");
  }
  return path;
}

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(
    () => getPathWithoutBase(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getPathWithoutBase(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to, { replace = false } = {}) => {
    const base = import.meta.env.BASE_URL || "/";
    const targetPath = (base + to.replace(/^\//, "")).replace(/\/+/g, "/");
    if (replace) {
      window.history.replaceState({}, "", targetPath);
    } else {
      window.history.pushState({}, "", targetPath);
    }
    setCurrentPath(to);
  };

  return {
    currentPath,
    setCurrentPath,
    navigate,
  };
}
