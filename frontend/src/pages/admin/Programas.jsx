import { useState, useEffect } from 'react';
import { institucionService } from '../../services/api';
import { BookOpen, Plus, Edit, AlertCircle } from 'lucide-react';

export default function Programas() {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', descripcion: '', duracion_ciclos: 6, activo: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await institucionService.getProgramas();
      setProgramas(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar programas' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await institucionService.updatePrograma(editingId, formData);
      } else {
        await institucionService.createPrograma(formData);
      }
      loadData();
      resetForm();
      setMessage({ type: 'success', text: 'Programa guardado exitosamente' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleEdit = (programa) => {
    setFormData({
      codigo: programa.codigo || '',
      nombre: programa.nombre,
      descripcion: programa.descripcion || '',
      duracion_ciclos: programa.duracion_ciclos || 6,
      activo: programa.activo
    });
    setEditingId(programa.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ codigo: '', nombre: '', descripcion: '', duracion_ciclos: 6, activo: true });
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
          <BookOpen className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Programas de Estudio</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Programa
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

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg animate-fadeIn">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">{editingId ? 'Editar Programa' : 'Nuevo Programa'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Código</label>
                  <input type="text" value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="input" placeholder="COMP-01" />
                </div>
                <div>
                  <label className="label">Duración (ciclos)</label>
                  <input type="number" value={formData.duracion_ciclos}
                    onChange={(e) => setFormData({ ...formData, duracion_ciclos: parseInt(e.target.value) })}
                    className="input" min="1" max="12" />
                </div>
              </div>
              <div>
                <label className="label">Nombre *</label>
                <input type="text" value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input" required />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input" rows="3" />
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
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No hay programas registrados</td></tr>
              ) : programas.map((programa) => (
                <tr key={programa.id}>
                  <td className="font-mono text-sm">{programa.codigo || '-'}</td>
                  <td className="font-medium">{programa.nombre}</td>
                  <td>{programa.duracion_ciclos} ciclos</td>
                  <td>{programa.activo ? <span className="badge-success">Activo</span> : <span className="badge-gray">Inactivo</span>}</td>
                  <td>
                    <button onClick={() => handleEdit(programa)} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg">
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
