import { useState, useEffect } from 'react';
import { institucionService } from '../../services/api';
import { Calendar, Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react';

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    semestre: 1,
    fecha_inicio: '',
    fecha_fin: '',
    activo: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPeriodos();
  }, []);

  const loadPeriodos = async () => {
    try {
      const response = await institucionService.getPeriodos();
      setPeriodos(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar periodos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (editingId) {
        await institucionService.updatePeriodo(editingId, formData);
        setMessage({ type: 'success', text: 'Periodo actualizado' });
      } else {
        await institucionService.createPeriodo(formData);
        setMessage({ type: 'success', text: 'Periodo creado' });
      }
      loadPeriodos();
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleEdit = (periodo) => {
    setFormData({
      nombre: periodo.nombre,
      anio: periodo.anio,
      semestre: periodo.semestre,
      fecha_inicio: periodo.fecha_inicio || '',
      fecha_fin: periodo.fecha_fin || '',
      activo: periodo.activo
    });
    setEditingId(periodo.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este periodo?')) return;

    try {
      await institucionService.deletePeriodo(id);
      loadPeriodos();
      setMessage({ type: 'success', text: 'Periodo eliminado' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al eliminar' });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      anio: new Date().getFullYear(),
      semestre: 1,
      fecha_inicio: '',
      fecha_fin: '',
      activo: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Periodos Lectivos</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Periodo
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <AlertCircle className="w-5 h-5" />
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Editar Periodo' : 'Nuevo Periodo'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input"
                  placeholder="Ej: 2026-I"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Año *</label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                    className="input"
                    min="2020"
                    required
                  />
                </div>
                <div>
                  <label className="label">Semestre *</label>
                  <select
                    value={formData.semestre}
                    onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) })}
                    className="input"
                    required
                  >
                    <option value={1}>I</option>
                    <option value={2}>II</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300"
                />
                <label htmlFor="activo" className="text-sm text-gray-700">
                  Periodo Activo (solo puede haber uno activo)
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Año</th>
                <th>Semestre</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No hay periodos registrados
                  </td>
                </tr>
              ) : (
                periodos.map((periodo) => (
                  <tr key={periodo.id}>
                    <td className="font-medium">{periodo.nombre}</td>
                    <td>{periodo.anio}</td>
                    <td>{periodo.semestre === 1 ? 'I' : 'II'}</td>
                    <td>{periodo.fecha_inicio || '-'}</td>
                    <td>{periodo.fecha_fin || '-'}</td>
                    <td>
                      {periodo.activo ? (
                        <span className="badge-success">Activo</span>
                      ) : (
                        <span className="badge-gray">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(periodo)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(periodo.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
