import { useState } from "react";
import { Icon } from "@iconify/react";

export function Sidebar({ isConnected, activeView, navigate }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState("bun");

  const proxyUrl =
    `${window.location.origin}${import.meta.env.BASE_URL}proxy.js`.replace(
      /([^:]\/)\/+/g,
      "$1",
    );

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
          {isConnected ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 leading-none shrink-0">
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200 leading-none shrink-0">
              Disconnected
            </span>
          )}
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

        {/* Proxy Instructions */}
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Tabs Header */}
            <div className="flex border-b border-zinc-200 text-xs">
              <button
                onClick={() => setActiveTab("bun")}
                className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all cursor-pointer ${
                  activeTab === "bun"
                    ? "border-zinc-950 text-zinc-950 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Bun
              </button>
              <button
                onClick={() => setActiveTab("node")}
                className={`flex-1 py-1.5 text-center font-medium border-b-2 transition-all cursor-pointer ${
                  activeTab === "node"
                    ? "border-zinc-950 text-zinc-950 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Node
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-3 bg-zinc-950 text-zinc-300 rounded-lg border border-zinc-800 shadow-inner font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap">
              {activeTab === "bun" ? (
                <div className="text-emerald-400 select-all">
                  curl -s {proxyUrl} | bun run - --id 123 --access-token "xxx"
                </div>
              ) : (
                <div className="text-amber-400 select-all">
                  curl -s {proxyUrl} | node - --id 123 --access-token "xxx"
                </div>
              )}
            </div>
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
              if (isConnected) {
                navigate("/automation");
                setIsCollapsed(true);
              }
            }}
            disabled={!isConnected}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md font-medium transition-all border-none bg-transparent ${
              !isConnected
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
