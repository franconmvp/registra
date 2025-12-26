import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notasService } from '../../services/api';
import { BookOpen, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

export default function MisUnidades() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await notasService.getMisUnidades();
      setData(response.data.data);
    } catch (err) {
      setError('Error al cargar unidades');
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
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Mis Unidades Didácticas</h1>
        </div>
        {data?.periodo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-800 rounded-lg">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{data.periodo.nombre}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {unidades.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          No tiene unidades asignadas en el periodo actual
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unidades.map(u => (
            <div key={u.docente_unidad_id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{u.unidad_nombre}</h3>
                    <p className="text-sm text-gray-500">{u.unidad_codigo}</p>
                  </div>
                  {u.acta_cerrada ? (
                    <span className="badge-success">Cerrada</span>
                  ) : (
                    <span className="badge-warning">Pendiente</span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><strong>Programa:</strong> {u.programa_nombre}</p>
                  <p><strong>Ciclo:</strong> {u.ciclo} | <strong>Turno:</strong> {u.turno_nombre}</p>
                  <p><strong>Sección:</strong> {u.seccion}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold text-primary-800">{u.total_estudiantes}</span>
                    <p className="text-xs text-gray-500">estudiantes</p>
                  </div>
                  {!u.acta_cerrada && (
                    <Link to={`/docente/notas/${u.docente_unidad_id}`} className="btn-primary flex items-center gap-2">
                      Notas <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
