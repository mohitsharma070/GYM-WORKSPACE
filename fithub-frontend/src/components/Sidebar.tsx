import { Home, Users, Dumbbell, CreditCard, Calendar, FileText, Settings, LogOut, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  userType: 'admin' | 'trainer' | 'member';
}

export function Sidebar({ activePage, onPageChange, userType }: SidebarProps) {
  const getMenuItems = () => {
    if (userType === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Dashboard', icon: Home },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'trainers', label: 'Trainers', icon: Dumbbell },
        { id: 'plans', label: 'Plans', icon: FileText },
        { id: 'products', label: 'Products', icon: FileText },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'profile', label: 'Profile', icon: Settings },
      ];
    } else if (userType === 'trainer') {
      return [
        { id: 'trainer-dashboard', label: 'Dashboard', icon: Home },
        { id: 'clients', label: 'My Clients', icon: Users, badge: '24' },
        { id: 'schedule', label: 'Schedule', icon: Calendar, badge: '8' },
        { id: 'profile', label: 'Profile', icon: Settings },
      ];
    } else {
      return [
        { id: 'member-dashboard', label: 'Dashboard', icon: Home },
        { id: 'plans', label: 'Plans', icon: FileText },
        { id: 'subscriptions', label: 'My Subscription', icon: CreditCard },
        { id: 'mark-attendance', label: 'Mark Attendance', icon: Calendar },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'profile', label: 'Profile', icon: Settings },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-60 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm">
      <div className="h-20 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl flex items-center justify-center shadow-md">
            <Dumbbell size={22} className="text-white" />
          </div>
          <span className="text-xl font-semibold text-[var(--color-text)]">FitHub</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-md'
                  : 'text-[var(--color-muted)] hover:bg-gray-100 hover:text-[var(--color-text)]'
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
                    : 'bg-gray-200 text-[var(--color-muted)]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        {userType === 'member' && (
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-lg p-4 mb-4 text-white">
            <p className="text-xs mb-2 opacity-90">Need help?</p>
            <p className="text-sm mb-3">Contact support for assistance</p>
            <button className="w-full bg-white text-[var(--color-primary)] text-sm py-2 rounded-lg hover:bg-opacity-90 transition-all">
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
          className="w-full flex items-center gap-3 px-4 py-3 text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
