import { useState, useEffect } from 'react';
import { institucionService } from '../../services/api';
import { FileText, Plus, Edit, Eye, AlertCircle, X } from 'lucide-react';

export default function Planes() {
  const [planes, setPlanes] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUnidades, setShowUnidades] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', programa_id: '', resolucion: '', fecha_aprobacion: '', activo: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [planesRes, programasRes] = await Promise.all([
        institucionService.getPlanes(),
        institucionService.getProgramas()
      ]);
      setPlanes(planesRes.data.data);
      setProgramas(programasRes.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await institucionService.updatePlan(editingId, formData);
      } else {
        await institucionService.createPlan(formData);
      }
      loadData();
      resetForm();
      setMessage({ type: 'success', text: 'Plan guardado exitosamente' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleViewUnidades = async (planId) => {
    try {
      const response = await institucionService.getPlan(planId);
      setShowUnidades(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar unidades' });
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      codigo: plan.codigo || '',
      nombre: plan.nombre,
      programa_id: plan.programa_id,
      resolucion: plan.resolucion || '',
      fecha_aprobacion: plan.fecha_aprobacion || '',
      activo: plan.activo
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ codigo: '', nombre: '', programa_id: '', resolucion: '', fecha_aprobacion: '', activo: true });
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
          <FileText className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Planes de Estudio</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Plan
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
          <div className="bg-white rounded-xl w-full max-w-lg animate-fadeIn">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">{editingId ? 'Editar Plan' : 'Nuevo Plan'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Programa de Estudio *</label>
                <select value={formData.programa_id}
                  onChange={(e) => setFormData({ ...formData, programa_id: e.target.value })}
                  className="input" required>
                  <option value="">Seleccionar...</option>
                  {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Código</label>
                  <input type="text" value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="input" />
                </div>
                <div>
                  <label className="label">Resolución</label>
                  <input type="text" value={formData.resolucion}
                    onChange={(e) => setFormData({ ...formData, resolucion: e.target.value })}
                    className="input" />
                </div>
              </div>
              <div>
                <label className="label">Nombre *</label>
                <input type="text" value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input" required />
              </div>
              <div>
                <label className="label">Fecha de Aprobación</label>
                <input type="date" value={formData.fecha_aprobacion}
                  onChange={(e) => setFormData({ ...formData, fecha_aprobacion: e.target.value })}
                  className="input" />
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

      {/* Unidades Modal */}
      {showUnidades && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{showUnidades.nombre}</h2>
                <p className="text-sm text-gray-500 mt-1">{showUnidades.programa_nombre}</p>
              </div>
              <button onClick={() => setShowUnidades(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {showUnidades.unidades?.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Unidad Didáctica</th>
                      <th>Ciclo</th>
                      <th>Créditos</th>
                      <th>H. Teoría</th>
                      <th>H. Práctica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showUnidades.unidades.map(u => (
                      <tr key={u.id}>
                        <td className="font-mono text-sm">{u.codigo}</td>
                        <td className="font-medium">{u.nombre}</td>
                        <td>{u.ciclo}</td>
                        <td>{u.creditos}</td>
                        <td>{u.horas_teoria}</td>
                        <td>{u.horas_practica}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay unidades didácticas registradas</p>
              )}
            </div>
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
                <th>Programa</th>
                <th>Resolución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No hay planes registrados</td></tr>
              ) : planes.map((plan) => (
                <tr key={plan.id}>
                  <td className="font-mono text-sm">{plan.codigo || '-'}</td>
                  <td className="font-medium">{plan.nombre}</td>
                  <td>{plan.programa_nombre}</td>
                  <td>{plan.resolucion || '-'}</td>
                  <td>{plan.activo ? <span className="badge-success">Activo</span> : <span className="badge-gray">Inactivo</span>}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleViewUnidades(plan.id)} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg" title="Ver unidades">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(plan)} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
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
