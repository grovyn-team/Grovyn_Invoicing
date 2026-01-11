import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/invoices', icon: '📄', label: 'Invoices' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/clients', icon: '👥', label: 'Clients' },
    { path: '/audit', icon: '📋', label: 'Audit Logs' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
        }}
        className="fixed top-0 left-0 h-full w-[17.5rem] bg-white border-r border-gray-200 z-50 lg:static lg:translate-x-0 lg:z-auto"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900">GROVYN</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-4">
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              <span className="text-lg">⚙️</span>
              <span>System Settings</span>
            </Link>
            <div className="px-4 py-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">AUTHENTICATED AS</div>
              <div className="text-sm font-semibold text-gray-900">Root Admin</div>
            </div>
            <button className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full text-left">
              <span className="text-lg">→</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
