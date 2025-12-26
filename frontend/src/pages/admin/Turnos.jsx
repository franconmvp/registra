import { useState, useEffect } from 'react';
import { institucionService } from '../../services/api';
import { Clock, Plus, Edit, AlertCircle } from 'lucide-react';

export default function Turnos() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', hora_inicio: '', hora_fin: '', activo: true });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await institucionService.getTurnos();
      setTurnos(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar turnos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await institucionService.updateTurno(editingId, formData);
      } else {
        await institucionService.createTurno(formData);
      }
      loadData();
      resetForm();
      setMessage({ type: 'success', text: 'Turno guardado exitosamente' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleEdit = (turno) => {
    setFormData({
      nombre: turno.nombre,
      hora_inicio: turno.hora_inicio || '',
      hora_fin: turno.hora_fin || '',
      activo: turno.activo
    });
    setEditingId(turno.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ nombre: '', hora_inicio: '', hora_fin: '', activo: true });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
    </div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Turnos</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Turno
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle className="w-5 h-5" /> {message.text}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">{editingId ? 'Editar Turno' : 'Nuevo Turno'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input type="text" value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Hora Inicio</label>
                  <input type="time" value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="input" />
                </div>
                <div>
                  <label className="label">Hora Fin</label>
                  <input type="time" value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                    className="input" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded" />
                <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-primary">{editingId ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th>Hora Inicio</th><th>Hora Fin</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {turnos.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No hay turnos registrados</td></tr>
              ) : turnos.map((turno) => (
                <tr key={turno.id}>
                  <td className="font-medium">{turno.nombre}</td>
                  <td>{turno.hora_inicio || '-'}</td>
                  <td>{turno.hora_fin || '-'}</td>
                  <td>{turno.activo ? <span className="badge-success">Activo</span> : <span className="badge-gray">Inactivo</span>}</td>
                  <td>
                    <button onClick={() => handleEdit(turno)} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
