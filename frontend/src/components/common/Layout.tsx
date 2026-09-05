import React, { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Menu as MenuIcon,
  BarChart3,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MapPin, label: 'Territórios', path: '/territories' },
    { icon: Calendar, label: 'Designações', path: '/designations' },
    { icon: Users, label: 'Congregação', path: '/congregation' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: BookOpen, label: 'Publicações', path: '/publications' },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] flex transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] transition-all duration-300 flex-col fixed h-full z-30`}>
        {/* Logo */}
        <div className="p-4 border-b border-[rgb(var(--border))] flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white text-lg font-bold">📖</span>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-[rgb(var(--foreground))]">Organizados</h1>
              <p className="text-xs text-[rgb(var(--foreground))] opacity-60">Portal da Congregação</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-[rgb(var(--foreground))] opacity-80 hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all group"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[rgb(var(--border))] space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 text-[rgb(var(--foreground))] opacity-80 hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {sidebarOpen && <span className="text-sm font-medium">{isDark ? '☀️ Tema Claro' : '🌙 Tema Escuro'}</span>}
          </button>

          <div className="flex items-center gap-3 pt-2 border-t border-[rgb(var(--border))]">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{user?.name}</p>
                <p className="text-xs text-[rgb(var(--foreground))] opacity-60 truncate capitalize">{user?.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[rgb(var(--card))] border-b border-[rgb(var(--border))] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[rgb(var(--foreground))]">
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">📖</span>
            </div>
            <h1 className="text-lg font-bold text-[rgb(var(--foreground))]">Organizados</h1>
          </div>
        </div>
        <button onClick={toggleTheme} className="p-2 text-[rgb(var(--foreground))]">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[rgb(var(--card))] p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">📖</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[rgb(var(--foreground))]">Organizados</h1>
                  <p className="text-xs text-[rgb(var(--foreground))] opacity-60">Portal da Congregação</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-[rgb(var(--foreground))]">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[rgb(var(--foreground))] opacity-80 hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-[rgb(var(--border))]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">{user?.name}</p>
                    <p className="text-xs text-[rgb(var(--foreground))] opacity-60 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} md:mt-0 mt-16`}>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;