import { useState, useEffect } from 'react';
import { docentesService, institucionService } from '../../services/api';
import { Link2, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ periodo_id: '', docente_id: '' });
  const [formData, setFormData] = useState({ docente_id: '', unidad_didactica_id: '', periodo_id: '', turno_id: '', seccion: 'A' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [docentesRes, periodosRes, turnosRes, unidadesRes] = await Promise.all([
        docentesService.getAll({ activo: true }),
        institucionService.getPeriodos(),
        institucionService.getTurnos(),
        institucionService.getUnidades()
      ]);
      setDocentes(docentesRes.data.data);
      setPeriodos(periodosRes.data.data);
      setTurnos(turnosRes.data.data);
      setUnidades(unidadesRes.data.data);

      const periodoActivo = periodosRes.data.data.find(p => p.activo);
      if (periodoActivo) {
        setFilters({ ...filters, periodo_id: periodoActivo.id });
        loadAsignaciones(periodoActivo.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar datos' });
      setLoading(false);
    }
  };

  const loadAsignaciones = async (periodoId, docenteId) => {
    try {
      const response = await docentesService.getAsignaciones({ periodo_id: periodoId, docente_id: docenteId });
      setAsignaciones(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar asignaciones' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    loadAsignaciones(filters.periodo_id, filters.docente_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await docentesService.asignarUnidad(formData);
      setMessage({ type: 'success', text: 'Asignación creada exitosamente' });
      loadAsignaciones(filters.periodo_id, filters.docente_id);
      setShowForm(false);
      setFormData({ docente_id: '', unidad_didactica_id: '', periodo_id: '', turno_id: '', seccion: 'A' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al crear asignación' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta asignación?')) return;
    try {
      await docentesService.eliminarAsignacion(id);
      loadAsignaciones(filters.periodo_id, filters.docente_id);
      setMessage({ type: 'success', text: 'Asignación eliminada' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al eliminar' });
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Asignación de Docentes</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Asignación
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle className="w-5 h-5" /> {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select value={filters.periodo_id} onChange={(e) => setFilters({ ...filters, periodo_id: e.target.value })} className="input">
              <option value="">Todos los periodos</option>
              {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select value={filters.docente_id} onChange={(e) => setFilters({ ...filters, docente_id: e.target.value })} className="input">
              <option value="">Todos los docentes</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{`${d.apellido_paterno} ${d.nombres}`}</option>)}
            </select>
            <button onClick={handleFilter} className="btn-primary">Filtrar</button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg animate-fadeIn">
            <div className="p-6 border-b"><h2 className="text-xl font-semibold">Nueva Asignación</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Docente *</label>
                <select value={formData.docente_id} onChange={(e) => setFormData({ ...formData, docente_id: e.target.value })} className="input" required>
                  <option value="">Seleccionar...</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{`${d.apellido_paterno} ${d.apellido_materno || ''}, ${d.nombres}`}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Unidad Didáctica *</label>
                <select value={formData.unidad_didactica_id} onChange={(e) => setFormData({ ...formData, unidad_didactica_id: e.target.value })} className="input" required>
                  <option value="">Seleccionar...</option>
                  {unidades.map(u => <option key={u.id} value={u.id}>{`${u.codigo} - ${u.nombre} (Ciclo ${u.ciclo})`}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Periodo *</label>
                  <select value={formData.periodo_id} onChange={(e) => setFormData({ ...formData, periodo_id: e.target.value })} className="input" required>
                    <option value="">Seleccionar...</option>
                    {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Turno *</label>
                  <select value={formData.turno_id} onChange={(e) => setFormData({ ...formData, turno_id: e.target.value })} className="input" required>
                    <option value="">Seleccionar...</option>
                    {turnos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Sección</label>
                <input type="text" value={formData.seccion} onChange={(e) => setFormData({ ...formData, seccion: e.target.value })} className="input" placeholder="A" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-primary">Crear Asignación</button>
              </div>
            </form>
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
                <tr><th>Docente</th><th>Unidad Didáctica</th><th>Ciclo</th><th>Periodo</th><th>Turno</th><th>Sección</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {asignaciones.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-gray-500">No hay asignaciones</td></tr>
                ) : asignaciones.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium">{`${a.docente_apellido}, ${a.docente_nombres}`}</td>
                    <td>{a.unidad_nombre}</td>
                    <td className="text-center">{a.ciclo}</td>
                    <td>{a.periodo_nombre}</td>
                    <td>{a.turno_nombre}</td>
                    <td className="text-center">{a.seccion}</td>
                    <td>
                      <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
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
