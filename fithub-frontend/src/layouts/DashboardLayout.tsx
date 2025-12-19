import { Sidebar } from "../components/Sidebar";

export default function DashboardLayout({
  userRole,
  children,
}: {
  userRole: "admin" | "trainer" | "member" | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar userType={userRole} />

      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}
