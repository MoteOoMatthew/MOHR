import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  UserCheck, 
  Settings,
  LogOut
} from 'lucide-react';

const MobileNavigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      show: true,
    },
    {
      path: '/employees',
      icon: Users,
      label: 'Employees',
      show: true,
    },
    {
      path: '/users',
      icon: UserCheck,
      label: 'Users',
      show: user?.role === 'admin',
    },
    {
      path: '/profile',
      icon: Settings,
      label: 'Profile',
      show: true,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="mobile-nav safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-primary-600'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-danger-600 transition-colors duration-200"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation; 