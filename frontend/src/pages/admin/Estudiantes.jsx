import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { estudiantesService, institucionService } from '../../services/api';
import { Users, Plus, Edit, Eye, Search, Filter, AlertCircle } from 'lucide-react';

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', programa_id: '', estado: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [estudiantesRes, programasRes] = await Promise.all([
        estudiantesService.getAll(filters),
        institucionService.getProgramas()
      ]);
      setEstudiantes(estudiantesRes.data.data);
      setProgramas(programasRes.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await estudiantesService.getAll(filters);
      setEstudiantes(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al buscar' });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'activo': return <span className="badge-success">Activo</span>;
      case 'egresado': return <span className="badge-info">Egresado</span>;
      case 'retirado': return <span className="badge-danger">Retirado</span>;
      case 'suspendido': return <span className="badge-warning">Suspendido</span>;
      default: return <span className="badge-gray">{estado}</span>;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Estudiantes</h1>
        </div>
        <Link to="/admin/estudiantes/nuevo" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Estudiante
        </Link>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle className="w-5 h-5" /> {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o DNI..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="input pl-10"
                />
              </div>
            </div>
            <select value={filters.programa_id} onChange={(e) => setFilters({ ...filters, programa_id: e.target.value })} className="input">
              <option value="">Todos los programas</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })} className="input">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="egresado">Egresado</option>
              <option value="retirado">Retirado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>DNI</th>
                  <th>Estudiante</th>
                  <th>Programa</th>
                  <th>Ciclo</th>
                  <th>Turno</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-8 text-gray-500">No hay estudiantes registrados</td></tr>
                ) : estudiantes.map((e) => (
                  <tr key={e.id}>
                    <td className="font-mono text-sm">{e.codigo_estudiante}</td>
                    <td>{e.dni}</td>
                    <td className="font-medium">{`${e.apellido_paterno} ${e.apellido_materno || ''}, ${e.nombres}`}</td>
                    <td className="text-sm">{e.programa_nombre || '-'}</td>
                    <td className="text-center">{e.ciclo_actual || '-'}</td>
                    <td>{e.turno_nombre || '-'}</td>
                    <td>{getEstadoBadge(e.estado)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/estudiantes/${e.id}`} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
