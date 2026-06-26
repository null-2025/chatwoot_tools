import { useEffect } from "react";
import { useCredentials } from "./hooks/useCredentials";
import { useRouter } from "./hooks/useRouter";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { Automation } from "./views/Automation";
import "./App.css";

function App() {
  const {
    accountId,
    setAccountId,
    apiToken,
    setApiToken,
    isLoggedIn,
  } = useCredentials();

  const { currentPath, setCurrentPath, navigate } = useRouter();

  // Auth Guard: Redirect back to '/' if logged out and on another page
  useEffect(() => {
    if (!isLoggedIn && currentPath !== "/") {
      window.history.replaceState({}, "", "/");
      setCurrentPath("/");
    }
  }, [isLoggedIn, currentPath, setCurrentPath]);

  // Determine active view based on guard and pathname
  const activeView = isLoggedIn ? currentPath : "/";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-50/50 text-zinc-900 font-sans">
      {/* Sidebar Layout */}
      <Sidebar
        accountId={accountId}
        setAccountId={setAccountId}
        apiToken={apiToken}
        setApiToken={setApiToken}
        isLoggedIn={isLoggedIn}
        activeView={activeView}
        navigate={navigate}
      />

      {/* Main Content Layout */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl">
        {activeView === "/automation" ? (
          <Automation navigate={navigate} />
        ) : (
          <Dashboard isLoggedIn={isLoggedIn} navigate={navigate} />
        )}
      </main>
    </div>
  );
}

export default App;
