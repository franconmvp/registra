import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notasService, institucionService } from '../../services/api';
import { BookOpen, Users, FileText, Calendar, ArrowRight } from 'lucide-react';

export default function DocenteDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await notasService.getMisUnidades();
      setData(response.data.data);
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

  const unidades = data?.unidades || [];

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel del Docente</h1>
          <p className="text-gray-500 mt-1">Bienvenido al Sistema de Gestión Educativa</p>
        </div>
        {data?.periodo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-800 rounded-lg">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Periodo: {data.periodo.nombre}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="stat-value">{unidades.length}</div>
              <div className="stat-label">Unidades Asignadas</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="stat-value">{unidades.reduce((sum, u) => sum + (u.total_estudiantes || 0), 0)}</div>
              <div className="stat-label">Total Estudiantes</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="stat-value">{unidades.filter(u => u.acta_cerrada).length}</div>
              <div className="stat-label">Actas Cerradas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unidades */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Mis Unidades Didácticas</h3>
        </div>
        <div className="card-body">
          {unidades.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tiene unidades asignadas en el periodo actual</p>
          ) : (
            <div className="space-y-3">
              {unidades.map(u => (
                <div key={u.docente_unidad_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{u.unidad_nombre}</p>
                    <p className="text-sm text-gray-500">{u.programa_nombre} | Ciclo {u.ciclo} | {u.turno_nombre} | Sección {u.seccion}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-lg font-semibold text-primary-800">{u.total_estudiantes}</span>
                      <p className="text-xs text-gray-500">estudiantes</p>
                    </div>
                    {u.acta_cerrada ? (
                      <span className="badge-success">Acta cerrada</span>
                    ) : (
                      <Link to={`/docente/notas/${u.docente_unidad_id}`} className="btn-primary flex items-center gap-2 text-sm">
                        Registrar Notas <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
