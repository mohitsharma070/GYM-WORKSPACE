import { useState } from "react";
import { Sidebar } from "../components/Sidebar";

// ADMIN PAGES
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersPage from "../pages/admin/UsersPage";
import TrainersPage from "../pages/admin/TrainersPage";
import PlansPageForAdmin from "../pages/admin/PlansPageForAdmin";
import ProductsPage from "../pages/admin/ProductsPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import ProfilePage from "../pages/admin/ProfilePage";   // <-- ADDED
import AttendancePage from "../pages/admin/AttendancePage";

// TRAINER PAGES
import TrainerDashboard from "../pages/trainer/TrainerDashboard";
import ClientsPage from "../pages/trainer/ClientsPage";
import TrainerSchedule from "../pages/trainer/TrainerSchedule";

// MEMBER PAGES
import MemberDashboard from "../pages/member/MemberDashboard";
import PlansPage from "../pages/member/PlansPage";
import SubscriptionPage from "../pages/member/SubscriptionPage";
import MemberSchedule from "../pages/member/MemberSchedule";
import AttendancePageForMember from "../pages/member/AttendancePage";

export default function DashboardLayout({
  userRole,
}: {
  userRole: "admin" | "trainer" | "member";
}) {
  const [activePage, setActivePage] = useState(`${userRole}-dashboard`);

  function renderPage() {

    // --------------------------------------
    // ADMIN
    // --------------------------------------
    if (userRole === "admin") {
      switch (activePage) {
        case "admin-dashboard":
          return <AdminDashboard />;
        case "users":
          return <UsersPage />;
        case "trainers":
          return <TrainersPage />;
        case "plans":
          return <PlansPageForAdmin />;
        case "products":
          return <ProductsPage />;
        case "analytics":
          return <AnalyticsPage />;
        case "attendance":
          return <AttendancePage />;
        case "profile": // <-- ADDED
          return <ProfilePage />;
        default:
          return <AdminDashboard />;
      }
    }

    // --------------------------------------
    // TRAINER
    // --------------------------------------
    if (userRole === "trainer") {
      switch (activePage) {
        case "trainer-dashboard":
          return <TrainerDashboard />;
        case "clients":
          return <ClientsPage />;
        case "schedule":
          return <TrainerSchedule />;
        case "profile": // <-- ADDED
          return <ProfilePage />;
        default:
          return <TrainerDashboard />;
      }
    }

    // --------------------------------------
    // MEMBER
    // --------------------------------------
    if (userRole === "member") {
      switch (activePage) {
        case "member-dashboard":
          return <MemberDashboard />;
        case "plans":
          return <PlansPage />;
        case "subscriptions":
          return <SubscriptionPage />;
        case "mark-attendance":
          return <AttendancePageForMember />;
        case "schedule":
          return <MemberSchedule />;
        case "profile": // <-- ADDED
          return <ProfilePage />;
        default:
          return <MemberDashboard />;
      }
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        userType={userRole}
        activePage={activePage}
        onPageChange={setActivePage}
      />

      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}
