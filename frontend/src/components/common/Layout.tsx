import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Users,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User,
  BookOpen
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/territories', label: 'Territórios', icon: MapPin },
    { path: '/designations', label: 'Designações', icon: ClipboardList },
    { path: '/congregation', label: 'Congregação', icon: Users },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 }
  ];

  // Fechar sidebar ao clicar em um link no mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Overlay para mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-[var(--bg-secondary)] shadow-[var(--card-shadow)] border-r border-[var(--border-color)] transition-all duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${isSidebarOpen ? 'w-64' : 'w-20'} md:w-64`}
      >
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#1a3c6e] dark:text-blue-400" />
            {(isSidebarOpen || !isMobile) && (
              <div>
                <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  Portal
                </h1>
                <p className="text-xs text-[var(--text-muted)] -mt-1 font-medium">
                  Organizados
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--badge-bg)] text-[var(--badge-text)] font-semibold'
                    : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer da Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)] truncate flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{user?.name || 'Usuário'}</span>
              </p>
              <p className="text-[var(--text-muted)] text-xs truncate">
                {user?.email || ''}
              </p>
              <p className="text-[var(--text-muted)] text-xs mt-0.5">
                <span className="badge badge-blue text-xs">
                  {user?.accessLevel === 'admin' ? 'Administrador' : 
                   user?.accessLevel === 'support' ? 'Apoio' : 
                   'Visualizador'}
                </span>
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-hover)] text-yellow-400 hover:bg-[var(--border-color)]' 
                  : 'bg-[var(--bg-hover)] text-[#1a3c6e] hover:bg-[var(--border-color)]'
              }`}
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Botão Menu Mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 left-6 z-50 p-3 bg-[#1a3c6e] text-white rounded-full shadow-lg hover:bg-[#153058] transition-all duration-200 md:hidden"
        aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Conteúdo Principal */}
      <main 
        className={`flex-1 p-3 md:p-8 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <div className="container-custom p-3 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;