import { Home, Users, Dumbbell, CreditCard, Calendar, Settings, LogOut, BarChart3, Megaphone, ClipboardList, Package, ListChecks, Book, ClipboardCheck, User, type LucideProps } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'; // Import necessary types with 'type' keyword

// Define a type for the Lucide icon components
type IconComponent = ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & RefAttributes<SVGSVGElement> & LucideProps>; // Add LucideProps

// Define the MenuItem interface
interface MenuItem {
  path: string;
  label: string;
  icon: IconComponent; // Use the defined IconComponent type
  badge?: string; // Make badge optional
}

interface SidebarProps {
  userType: 'admin' | 'trainer' | 'member' | null;
}

export function Sidebar({ userType }: SidebarProps) {
  const location = useLocation();

  const getMenuItems = (): MenuItem[] => { // Specify return type as MenuItem[]
    if (userType === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/trainers', label: 'Trainers', icon: Dumbbell },
        { path: '/admin/plans', label: 'Plans', icon: ClipboardList },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/workout-plans', label: 'Workout Plans', icon: Dumbbell },
        { path: '/admin/attendance', label: 'Attendance', icon: Calendar },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/notifications/send', label: 'Broadcast', icon: Megaphone },
        { path: '/admin/notifications/logs', label: 'Notification Logs', icon: ListChecks },
        { path: '/admin/whatsapp-config', label: 'WhatsApp Config', icon: Settings }, // New link for WhatsApp config
        { path: '/admin/profile', label: 'Profile', icon: User },
      ];
    } else if (userType === 'trainer') {
      return [
        { path: '/trainer', label: 'Dashboard', icon: Home },
        { path: '/trainer/clients', label: 'My Clients', icon: Users, badge: '24' },
        { path: '/trainer/schedule', label: 'Schedule', icon: Calendar, badge: '8' },
        { path: '/trainer/profile', label: 'Profile', icon: User },
      ];
    } else if (userType === 'member') {
      return [
        { path: '/member', label: 'Dashboard', icon: Home },
        { path: '/member/plans', label: 'Membership Plans', icon: Book },
        { path: '/member/workout-plans', label: 'Workout Plans', icon: Dumbbell },
        { path: '/member/subscriptions', label: 'My Subscription', icon: CreditCard },
        { path: '/member/mark-attendance', label: 'Mark Attendance', icon: ClipboardCheck },
        { path: '/member/schedule', label: 'Schedule', icon: Calendar },
        { path: '/member/profile', label: 'Profile', icon: User },
      ];
    } else {
      return []; // Return an empty array if userType is null or unrecognized
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-60 bg-black border-r border-gray-800 h-screen flex flex-col shadow-sm">
      <div className="h-20 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
            <Dumbbell size={22} className="text-white" />
          </div>
          <span className="text-xl font-semibold text-white">FitHub</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-green-600 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        {userType === 'member' && (
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 mb-4 text-white">
            <p className="text-xs mb-2 opacity-90">Need help?</p>
            <p className="text-sm mb-3">Contact support for assistance</p>
            <button className="w-full bg-white text-green-600 text-sm py-2 rounded-lg hover:bg-opacity-90 transition-all">
              Get Support
            </button>
          </div>
        )}
        
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");

            // 🔥 Trigger re-render
            window.dispatchEvent(new Event("storage"));
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
