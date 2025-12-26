import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matriculaService, institucionService } from '../../services/api';
import { ClipboardList, Plus, Eye, Search, Filter, AlertCircle, FileText } from 'lucide-react';

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [filters, setFilters] = useState({ periodo_id: '', programa_id: '', estado: '', search: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [periodosRes, programasRes] = await Promise.all([
        institucionService.getPeriodos(),
        institucionService.getProgramas()
      ]);
      setPeriodos(periodosRes.data.data);
      setProgramas(programasRes.data.data);

      const periodoActivo = periodosRes.data.data.find(p => p.activo);
      if (periodoActivo) {
        setFilters({ ...filters, periodo_id: periodoActivo.id });
        loadMatriculas({ periodo_id: periodoActivo.id });
      } else {
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar datos' });
      setLoading(false);
    }
  };

  const loadMatriculas = async (params) => {
    try {
      const response = await matriculaService.getAll(params);
      setMatriculas(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar matrículas' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    loadMatriculas(filters);
  };

  const handleViewMatricula = async (id) => {
    try {
      const response = await matriculaService.getById(id);
      setSelectedMatricula(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar detalle' });
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'activa': return <span className="badge-success">Activa</span>;
      case 'anulada': return <span className="badge-danger">Anulada</span>;
      case 'finalizada': return <span className="badge-info">Finalizada</span>;
      default: return <span className="badge-gray">{estado}</span>;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Matrículas</h1>
        </div>
        <Link to="/admin/matriculas/nueva" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Matrícula
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
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Buscar estudiante..."
                value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                className="input pl-10" />
            </div>
            <select value={filters.periodo_id} onChange={(e) => setFilters({ ...filters, periodo_id: e.target.value })} className="input">
              <option value="">Todos los periodos</option>
              {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select value={filters.programa_id} onChange={(e) => setFilters({ ...filters, programa_id: e.target.value })} className="input">
              <option value="">Todos los programas</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <button onClick={handleFilter} className="btn-primary flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMatricula && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedMatricula.codigo_matricula}</h2>
                <p className="text-sm text-gray-500">{selectedMatricula.periodo_nombre}</p>
              </div>
              <button onClick={() => setSelectedMatricula(null)} className="btn-ghost">Cerrar</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div><span className="text-gray-500 text-sm">Estudiante</span>
                  <p className="font-medium">{`${selectedMatricula.apellido_paterno} ${selectedMatricula.apellido_materno || ''}, ${selectedMatricula.nombres}`}</p></div>
                <div><span className="text-gray-500 text-sm">DNI</span><p className="font-medium">{selectedMatricula.dni}</p></div>
                <div><span className="text-gray-500 text-sm">Ciclo</span><p className="font-medium">{selectedMatricula.ciclo}</p></div>
                <div><span className="text-gray-500 text-sm">Turno</span><p className="font-medium">{selectedMatricula.turno_nombre}</p></div>
              </div>
              <h3 className="font-semibold mb-3">Unidades Matriculadas</h3>
              <table className="table">
                <thead><tr><th>Código</th><th>Unidad Didáctica</th><th>Créditos</th><th>H. Teoría</th><th>H. Práctica</th><th>Docente</th></tr></thead>
                <tbody>
                  {selectedMatricula.detalles?.map(d => (
                    <tr key={d.id}>
                      <td className="font-mono text-sm">{d.unidad_codigo}</td>
                      <td>{d.unidad_nombre}</td>
                      <td className="text-center">{d.creditos}</td>
                      <td className="text-center">{d.horas_teoria}</td>
                      <td className="text-center">{d.horas_practica}</td>
                      <td>{d.docente_nombres ? `${d.docente_apellido}, ${d.docente_nombres}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                <tr><th>Código</th><th>Estudiante</th><th>Programa</th><th>Ciclo</th><th>Turno</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {matriculas.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-8 text-gray-500">No hay matrículas</td></tr>
                ) : matriculas.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-sm">{m.codigo_matricula}</td>
                    <td className="font-medium">{`${m.apellido_paterno} ${m.apellido_materno || ''}, ${m.nombres}`}</td>
                    <td className="text-sm">{m.programa_nombre || '-'}</td>
                    <td className="text-center">{m.ciclo}</td>
                    <td>{m.turno_nombre || '-'}</td>
                    <td className="text-sm">{m.fecha_matricula?.split('T')[0]}</td>
                    <td>{getEstadoBadge(m.estado)}</td>
                    <td>
                      <button onClick={() => handleViewMatricula(m.id)} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg" title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </button>
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
