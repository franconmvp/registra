import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { estudiantesService } from '../../services/api';
import { User, BookMarked, FileCheck, TrendingUp, ArrowRight } from 'lucide-react';

export default function EstudianteDashboard() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await estudiantesService.getMiPerfil();
      setPerfil(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
    </div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          ¡Bienvenido, {perfil?.nombres}!
        </h1>
        <p className="text-gray-500 mt-1">Panel del Estudiante</p>
      </div>

      {/* Info Card */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                {perfil?.apellido_paterno} {perfil?.apellido_materno}, {perfil?.nombres}
              </h2>
              <p className="text-gray-500">{perfil?.programa_nombre}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="text-sm"><strong>Código:</strong> {perfil?.codigo_estudiante}</span>
                <span className="text-sm"><strong>DNI:</strong> {perfil?.dni}</span>
                <span className="text-sm"><strong>Ciclo:</strong> {perfil?.ciclo_actual}</span>
                <span className="text-sm"><strong>Turno:</strong> {perfil?.turno_nombre}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`badge ${perfil?.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>
                {perfil?.estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/estudiante/perfil" className="card group hover:shadow-md transition-shadow">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Mi Perfil</h3>
                <p className="text-sm text-gray-500">Ver información personal</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </div>
        </Link>

        <Link to="/estudiante/historial" className="card group hover:shadow-md transition-shadow">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <BookMarked className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Historial Académico</h3>
                <p className="text-sm text-gray-500">Consultar notas y cursos</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </div>
        </Link>

        <Link to="/estudiante/matriculas" className="card group hover:shadow-md transition-shadow">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <FileCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Fichas de Matrícula</h3>
                <p className="text-sm text-gray-500">Ver matrículas realizadas</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
