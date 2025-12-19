import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login"; // Assuming Login is directly handled in App.tsx

import AdminNotificationLogsPage from "../pages/admin/AdminNotificationLogsPage";
import BroadcastPage from "../pages/admin/BroadcastPage";
import AdminWhatsAppConfigPage from "../pages/admin/AdminWhatsAppConfigPage"; // New import

// ADMIN PAGES
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersPage from "../pages/admin/UsersPage";
import TrainersPage from "../pages/admin/TrainersPage";
import PlansPageForAdmin from "../pages/admin/PlansPageForAdmin";
import ProductsPage from "../pages/admin/ProductsPage";
import AnalyticsPage from "../pages/admin/AnalyticsPage";
import ProfilePage from "../pages/admin/ProfilePage";
import AttendancePage from "../pages/admin/AttendancePage";

// TRAINER PAGES
import TrainerDashboard from "../pages/trainer/TrainerDashboard";
import ClientsPage from "../pages/trainer/ClientsPage";
import TrainerSchedule from "../pages/trainer/TrainerSchedule";

// MEMBER PAGES
import MemberDashboard from "../pages/member/MemberDashboard";
import MembershipPlansPage from "../pages/MembershipPlansPage";
import SubscriptionPage from "../pages/member/SubscriptionPage";
import MemberSchedule from "../pages/member/MemberSchedule";
import AttendancePageForMember from "../pages/member/AttendancePage";
import WorkoutPlansPage from "../pages/WorkoutPlansPage";


interface DashboardRoutesProps {
    userRole: "admin" | "trainer" | "member" | null;
    isAuthenticated: boolean;
    onLoginSuccess: (token: string, role: string) => void;
}

export default function DashboardRoutes({ userRole, isAuthenticated, onLoginSuccess }: DashboardRoutesProps) {
    const navigate = useNavigate();

    // If not authenticated, redirect to login page
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return <Login onLogin={onLoginSuccess} />;
    }

    return (
        <DashboardLayout userRole={userRole}>
            <Routes>
                {userRole === "admin" && (
                    <>
                        <Route path="admin" element={<AdminDashboard />} />
                        <Route path="admin/users" element={<UsersPage />} />
                        <Route path="admin/trainers" element={<TrainersPage />} />
                        <Route path="admin/plans" element={<PlansPageForAdmin />} />
                        <Route path="admin/products" element={<ProductsPage />} />
                        <Route path="admin/analytics" element={<AnalyticsPage />} />
                        <Route path="admin/workout-plans" element={<WorkoutPlansPage userRole={userRole} />} />
                        <Route path="admin/attendance" element={<AttendancePage />} />
                        <Route path="admin/profile" element={<ProfilePage />} />
                        <Route path="admin/notifications/logs" element={<AdminNotificationLogsPage />} />
                        <Route path="admin/notifications/send" element={<BroadcastPage />} />
                        <Route path="admin/whatsapp-config" element={<AdminWhatsAppConfigPage />} /> {/* New route for WhatsApp config */}
                        <Route path="*" element={<AdminDashboard />} /> {/* Default admin route */}
                    </>
                )}

                {userRole === "trainer" && (
                    <>
                        <Route path="trainer" element={<TrainerDashboard />} />
                        <Route path="trainer/clients" element={<ClientsPage />} />
                        <Route path="trainer/schedule" element={<TrainerSchedule />} />
                        <Route path="trainer/profile" element={<ProfilePage />} />
                        <Route path="*" element={<TrainerDashboard />} /> {/* Default trainer route */}
                    </>
                )}

                {userRole === "member" && (
                    <>
                        <Route path="member" element={<MemberDashboard />} />
                        <Route path="member/plans" element={<MembershipPlansPage />} />
                        <Route path="member/workout-plans" element={<WorkoutPlansPage userRole={userRole} />} />
                        <Route path="member/subscriptions" element={<SubscriptionPage />} />
                        <Route path="member/mark-attendance" element={<AttendancePageForMember />} />
                        <Route path="member/schedule" element={<MemberSchedule />} />
                        <Route path="member/profile" element={<ProfilePage />} />
                        <Route path="*" element={<MemberDashboard />} /> {/* Default member route */}
                    </>
                )}
            </Routes>
        </DashboardLayout>
    );
}