import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border p-4 shrink-0">
          <h2 className="text-foreground font-semibold">Sidebar</h2>
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <h2 className="text-foreground font-semibold">Main</h2>
        </main>
      </div>
    </div>
  );
}
