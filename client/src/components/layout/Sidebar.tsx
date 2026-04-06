import React from 'react';
import {
  LayoutDashboard,
  Images,
  Settings,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from '../BrandLogo';

interface SidebarProps {
  isOpen?: boolean;
  onLogout?: () => void;
}

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gallery', href: '/dashboard/galleries', icon: Images },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onLogout }) => {
  const location = useLocation();

  return (
    <div
      className={`hidden lg:flex flex-col w-64 bg-card border-r border-border transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link to="/" className="text-foreground inline-flex">
          <BrandLogo textClassName="text-xl" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : 'text-foreground hover:bg-border/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className={isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                />
                <span className="font-heading text-sm font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={18} className="text-accent-foreground" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {onLogout && (
        <div className="p-4 border-t border-border/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-red-500/10 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-heading text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
