import { useState } from "react";
import { Icon } from "@iconify/react";

export function Sidebar({
  accountId,
  setAccountId,
  apiToken,
  setApiToken,
  isLoggedIn,
  activeView,
  navigate,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col p-6 shrink-0 overflow-y-auto max-h-[40vh] md:max-h-full transition-all">
      {/* Branding Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <Icon
              icon="lucide:message-square"
              className="w-5 h-5 text-zinc-950"
            />
          </div>
          <h1 className="text-base font-bold tracking-tight text-zinc-950 leading-none">
            Chatwoot Tools
          </h1>
          <span
            className={`w-2 h-2 rounded-full ${
              isLoggedIn ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
            }`}
          />
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="md:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon
            icon={isCollapsed ? "lucide:menu" : "lucide:x"}
            className="w-5 h-5"
          />
        </button>
      </div>

      {/* Collapsible Content */}
      <div
        className={`${
          isCollapsed ? "hidden md:flex" : "flex"
        } flex-col flex-1 min-h-0`}
      >
        <hr className="border-zinc-100 -mx-6 mb-6 mt-6" />

        {/* Credentials Form */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="sidebar-account-id"
              className="block text-xs font-medium text-zinc-500"
            >
              Account ID
            </label>
            <input
              id="sidebar-account-id"
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. 1"
              className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sidebar-api-token"
              className="block text-xs font-medium text-zinc-500"
            >
              API Access Token
            </label>
            <input
              id="sidebar-api-token"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter access token"
              className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
            />
          </div>
        </div>

        <hr className="border-zinc-100 -mx-6 my-6" />

        {/* Navigation Menu */}
        <div className="space-y-1 flex-1">
          <button
            onClick={() => {
              navigate("/");
              setIsCollapsed(true);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer border-none bg-transparent ${
              activeView === "/"
                ? "bg-zinc-100 text-zinc-950 font-semibold"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <Icon icon="lucide:home" className="w-4 h-4" />
            </div>
            Dashboard
          </button>

          <button
            onClick={() => {
              if (isLoggedIn) {
                navigate("/automation");
                setIsCollapsed(true);
              }
            }}
            disabled={!isLoggedIn}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md font-medium transition-all border-none bg-transparent ${
              !isLoggedIn
                ? "text-zinc-400 opacity-50 cursor-not-allowed"
                : activeView === "/automation"
                  ? "bg-zinc-100 text-zinc-950 font-semibold cursor-pointer"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 cursor-pointer"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <Icon icon="lucide:settings" className="w-4 h-4" />
            </div>
            Automation
          </button>
        </div>
      </div>
    </aside>
  );
}

