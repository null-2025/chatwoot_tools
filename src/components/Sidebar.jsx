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
  return (
    <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col p-6 shrink-0">
      {/* Branding */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon icon="lucide:message-square" className="w-5 h-5 text-zinc-950 shrink-0" />
          <h1 className="text-base font-bold tracking-tight text-zinc-950 leading-none">
            Chatwoot Tools
          </h1>
        </div>
        <span
          className={`w-2 h-2 rounded-full ${
            isLoggedIn ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
          }`}
        />
      </div>

      <hr className="border-zinc-100 -mx-6 mb-6" />

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
          onClick={() => navigate("/")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer border-none bg-transparent ${
            activeView === "/"
              ? "bg-zinc-100 text-zinc-950 font-semibold"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
          }`}
        >
          <Icon icon="lucide:home" className="w-4 h-4 shrink-0" />
          Dashboard
        </button>

        <button
          onClick={() => isLoggedIn && navigate("/automation")}
          disabled={!isLoggedIn}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md font-medium transition-all border-none bg-transparent ${
            !isLoggedIn
              ? "text-zinc-400 opacity-50 cursor-not-allowed"
              : activeView === "/automation"
                ? "bg-zinc-100 text-zinc-950 font-semibold cursor-pointer"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 cursor-pointer"
          }`}
        >
          <Icon icon="lucide:settings" className="w-4 h-4 shrink-0" />
          Automation
        </button>
      </div>
    </aside>
  );
}
