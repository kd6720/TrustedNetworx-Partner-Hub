export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <div className="fixed left-0 top-0 z-40 h-screen w-64 sidebar-bg flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="h-9 w-9 rounded-lg bg-white/10 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-white/10 animate-pulse" />
              <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 ml-64">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="h-5 w-48 rounded bg-gray-100 animate-pulse" />
        </div>
        <main className="p-6 max-w-[1240px]">
          <div className="space-y-4">
            <div className="h-8 w-64 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-96 rounded bg-gray-100 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-xl bg-gray-100 animate-pulse mt-6" />
          </div>
        </main>
      </div>
    </div>
  );
}
