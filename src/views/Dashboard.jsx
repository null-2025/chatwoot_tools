import { Icon } from "@iconify/react";

export function Dashboard({ isLoggedIn, navigate }) {
  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 select-none">
        <span className="text-zinc-600 font-medium">Dashboard</span>
      </div>

      {/* Tools Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Automation Tool Card */}
        <div
          onClick={() => isLoggedIn && navigate("/automation")}
          role="button"
          tabIndex={isLoggedIn ? 0 : -1}
          aria-disabled={!isLoggedIn}
          onKeyDown={(e) => {
            if (isLoggedIn && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              navigate("/automation");
            }
          }}
          className={`p-5 rounded-xl border text-left flex items-center justify-between transition-all ${
            isLoggedIn
              ? "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-950"
              : "bg-zinc-50/30 border-zinc-200 opacity-60 cursor-not-allowed select-none"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-zinc-900">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              <Icon icon="lucide:settings" className="w-4 h-4" />
            </div>
            <span>Automation</span>
          </div>
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            {!isLoggedIn && (
              <Icon icon="lucide:lock" className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
