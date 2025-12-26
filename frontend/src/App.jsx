import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Layout from './components/Layout';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Institucion from './pages/admin/Institucion';
import Periodos from './pages/admin/Periodos';
import Programas from './pages/admin/Programas';
import Planes from './pages/admin/Planes';
import Turnos from './pages/admin/Turnos';
import Estudiantes from './pages/admin/Estudiantes';
import EstudianteForm from './pages/admin/EstudianteForm';
import Docentes from './pages/admin/Docentes';
import DocenteForm from './pages/admin/DocenteForm';
import Asignaciones from './pages/admin/Asignaciones';
import Matriculas from './pages/admin/Matriculas';
import MatriculaForm from './pages/admin/MatriculaForm';
import Usuarios from './pages/admin/Usuarios';
import ReporteMatriculas from './pages/admin/ReporteMatriculas';
import ReporteNotas from './pages/admin/ReporteNotas';

// Docente pages
import DocenteDashboard from './pages/docente/Dashboard';
import MisUnidades from './pages/docente/MisUnidades';
import RegistroNotas from './pages/docente/RegistroNotas';

// Estudiante pages
import EstudianteDashboard from './pages/estudiante/Dashboard';
import MiPerfil from './pages/estudiante/MiPerfil';
import MiHistorial from './pages/estudiante/MiHistorial';
import MisMatriculas from './pages/estudiante/MisMatriculas';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  // Redirect based on role
  const getHomeRoute = () => {
    if (!user) return '/login';
    switch (user.rol) {
      case 'administrador':
        return '/admin/dashboard';
      case 'docente':
        return '/docente/dashboard';
      case 'estudiante':
        return '/estudiante/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['administrador']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="institucion" element={<Institucion />} />
        <Route path="periodos" element={<Periodos />} />
        <Route path="programas" element={<Programas />} />
        <Route path="planes" element={<Planes />} />
        <Route path="turnos" element={<Turnos />} />
        <Route path="estudiantes" element={<Estudiantes />} />
        <Route path="estudiantes/nuevo" element={<EstudianteForm />} />
        <Route path="estudiantes/:id" element={<EstudianteForm />} />
        <Route path="docentes" element={<Docentes />} />
        <Route path="docentes/nuevo" element={<DocenteForm />} />
        <Route path="docentes/:id" element={<DocenteForm />} />
        <Route path="asignaciones" element={<Asignaciones />} />
        <Route path="matriculas" element={<Matriculas />} />
        <Route path="matriculas/nueva" element={<MatriculaForm />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="reportes/matriculas" element={<ReporteMatriculas />} />
        <Route path="reportes/notas" element={<ReporteNotas />} />
      </Route>

      {/* Docente Routes */}
      <Route path="/docente" element={
        <ProtectedRoute roles={['docente']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DocenteDashboard />} />
        <Route path="unidades" element={<MisUnidades />} />
        <Route path="notas/:docenteUnidadId" element={<RegistroNotas />} />
      </Route>

      {/* Estudiante Routes */}
      <Route path="/estudiante" element={
        <ProtectedRoute roles={['estudiante']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EstudianteDashboard />} />
        <Route path="perfil" element={<MiPerfil />} />
        <Route path="historial" element={<MiHistorial />} />
        <Route path="matriculas" element={<MisMatriculas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
