import { useEffect } from "react";
import { useProxy } from "./hooks/useProxy";
import { useRouter } from "./hooks/useRouter";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./views/Dashboard";
import { Automation } from "./views/Automation";
import "./App.css";

function App() {
  const { isConnected } = useProxy();

  const { currentPath, setCurrentPath, navigate } = useRouter();

  // Auth Guard: Redirect back to '/' if logged out and on another page
  useEffect(() => {
    if (!isConnected && currentPath !== "/") {
      window.history.replaceState({}, "", "/");
      setCurrentPath("/");
    }
  }, [isConnected, currentPath, setCurrentPath]);

  // Determine active view based on guard and pathname
  const activeView = isConnected ? currentPath : "/";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-50/50 text-zinc-900 font-sans overflow-hidden">
      {/* Sidebar Layout */}
      <Sidebar
        isConnected={isConnected}
        activeView={activeView}
        navigate={navigate}
      />

      {/* Main Content Layout */}
      <main
        className={`flex-1 w-full flex flex-col ${
          activeView === "/automation"
            ? "overflow-hidden"
            : "p-2 md:p-4 overflow-y-auto"
        }`}
      >
        {activeView === "/automation" ? (
          <Automation navigate={navigate} />
        ) : (
          <Dashboard isLoggedIn={isConnected} navigate={navigate} />
        )}
      </main>
    </div>
  );
}

export default App;
