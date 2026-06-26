import { Icon } from "@iconify/react";

export function Automation({ navigate }) {
  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumbs / Title */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
          <button
            onClick={() => navigate("/")}
            className="hover:text-zinc-900 transition-colors cursor-pointer border-none bg-transparent p-0"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-zinc-600 font-medium">Automation</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Automation
        </h2>
      </div>

      {/* Content Placeholder */}
      <div className="text-center py-12 max-w-xl">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
          <Icon icon="lucide:settings" className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">
          Automation Workspace
        </h3>
      </div>
    </div>
  );
}
