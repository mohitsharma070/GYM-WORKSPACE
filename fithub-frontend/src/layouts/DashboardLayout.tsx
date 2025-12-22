import { Sidebar } from "../components/Sidebar";

export default function DashboardLayout({
  userRole,
  children,
}: {
  userRole: "admin" | "trainer" | "member" | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userType={userRole} />

      <div className="flex-1 bg-blue-50 p-6 overflow-auto border-l border-gray-200">
        {children}
      </div>
    </div>
  );
}
