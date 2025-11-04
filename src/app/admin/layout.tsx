import Sidebar from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar></Sidebar>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
