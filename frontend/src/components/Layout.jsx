import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  GraduationCap, Home, Building2, Calendar, BookOpen, Users, UserCheck,
  ClipboardList, FileText, Settings, LogOut, Menu, X, ChevronDown,
  User, Bell, BarChart3, FileCheck, Clock, BookMarked
} from 'lucide-react';

const adminNavItems = [
  { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { 
    label: 'Institución', 
    icon: Building2,
    children: [
      { to: '/admin/institucion', label: 'Información General' },
      { to: '/admin/periodos', label: 'Periodos Lectivos' },
      { to: '/admin/turnos', label: 'Turnos' },
      { to: '/admin/programas', label: 'Programas de Estudio' },
      { to: '/admin/planes', label: 'Planes de Estudio' },
    ]
  },
  { to: '/admin/estudiantes', icon: Users, label: 'Estudiantes' },
  { 
    label: 'Docentes',
    icon: UserCheck,
    children: [
      { to: '/admin/docentes', label: 'Personal Docente' },
      { to: '/admin/asignaciones', label: 'Asignaciones' },
    ]
  },
  { to: '/admin/matriculas', icon: ClipboardList, label: 'Matrículas' },
  {
    label: 'Reportes',
    icon: BarChart3,
    children: [
      { to: '/admin/reportes/matriculas', label: 'Matrícula Semestral' },
      { to: '/admin/reportes/notas', label: 'Notas por Periodo' },
    ]
  },
  { to: '/admin/usuarios', icon: Settings, label: 'Usuarios' },
];

const docenteNavItems = [
  { to: '/docente/dashboard', icon: Home, label: 'Inicio' },
  { to: '/docente/unidades', icon: BookOpen, label: 'Mis Unidades' },
];

const estudianteNavItems = [
  { to: '/estudiante/dashboard', icon: Home, label: 'Inicio' },
  { to: '/estudiante/perfil', icon: User, label: 'Mi Perfil' },
  { to: '/estudiante/historial', icon: BookMarked, label: 'Historial Académico' },
  { to: '/estudiante/matriculas', icon: FileCheck, label: 'Fichas de Matrícula' },
];

function NavItem({ item, collapsed }) {
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full sidebar-link justify-between"
        >
          <span className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {!collapsed && <span>{item.label}</span>}
          </span>
          {!collapsed && (
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-secondary-500 text-white' 
                      : 'text-gray-300 hover:bg-primary-700 hover:text-white'
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
    >
      <item.icon className="w-5 h-5" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user?.rol) {
      case 'administrador':
        return adminNavItems;
      case 'docente':
        return docenteNavItems;
      case 'estudiante':
        return estudianteNavItems;
      default:
        return [];
    }
  };

  const getRolLabel = () => {
    switch (user?.rol) {
      case 'administrador':
        return 'Administrador';
      case 'docente':
        return 'Docente';
      case 'estudiante':
        return 'Estudiante';
      default:
        return '';
    }
  };

  const getUserName = () => {
    if (user?.estudiante) {
      return `${user.estudiante.nombres} ${user.estudiante.apellidoPaterno}`;
    }
    if (user?.docente) {
      return `${user.docente.nombres} ${user.docente.apellidoPaterno}`;
    }
    return user?.email || 'Usuario';
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full bg-primary-800 transition-all duration-300 
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-800" />
            </div>
            {sidebarOpen && (
              <span className="text-white font-semibold text-lg">SGE</span>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300 hover:text-white hidden lg:block"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item, index) => (
            <NavItem key={item.to || index} item={item} collapsed={!sidebarOpen} />
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-300 hover:bg-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-800">
              Sistema de Gestión Educativa
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{getUserName()}</p>
                <p className="text-xs text-gray-500">{getRolLabel()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
