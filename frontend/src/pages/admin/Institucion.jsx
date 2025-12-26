import { useState, useEffect } from 'react';
import { institucionService } from '../../services/api';
import { Building2, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Institucion() {
  const [data, setData] = useState({
    codigo_modular: '',
    nombre: '',
    tipo_ies: '',
    dre: '',
    direccion: '',
    telefono: '',
    correo: '',
    pagina_web: '',
    otros: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await institucionService.get();
      if (response.data.data) {
        setData(response.data.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar información' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await institucionService.update(data);
      setMessage({ type: 'success', text: 'Información actualizada correctamente' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">Información Institucional</h1>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Código Modular</label>
              <input
                type="text"
                name="codigo_modular"
                value={data.codigo_modular || ''}
                onChange={handleChange}
                className="input"
                placeholder="Código modular del IES"
              />
            </div>

            <div>
              <label className="label">Nombre de la Institución *</label>
              <input
                type="text"
                name="nombre"
                value={data.nombre || ''}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Tipo de IES</label>
              <select
                name="tipo_ies"
                value={data.tipo_ies || ''}
                onChange={handleChange}
                className="input"
              >
                <option value="">Seleccionar...</option>
                <option value="Público">Público</option>
                <option value="Privado">Privado</option>
              </select>
            </div>

            <div>
              <label className="label">DRE</label>
              <input
                type="text"
                name="dre"
                value={data.dre || ''}
                onChange={handleChange}
                className="input"
                placeholder="Dirección Regional de Educación"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={data.direccion || ''}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={data.telefono || ''}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Correo Electrónico</label>
              <input
                type="email"
                name="correo"
                value={data.correo || ''}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="label">Página Web</label>
              <input
                type="url"
                name="pagina_web"
                value={data.pagina_web || ''}
                onChange={handleChange}
                className="input"
                placeholder="https://"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Otros Datos</label>
              <textarea
                name="otros"
                value={data.otros || ''}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Información adicional..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
