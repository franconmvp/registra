import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { docentesService } from '../../services/api';
import { UserCheck, ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function DocenteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    dni: '', nombres: '', apellido_paterno: '', apellido_materno: '',
    fecha_nacimiento: '', genero: '', direccion: '', telefono: '', email: '',
    especialidad: '', grado_academico: '', condicion: 'contratado',
    fecha_ingreso: '', activo: true, password: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isEditing) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await docentesService.getById(id);
      const docente = response.data.data;
      setFormData({
        dni: docente.dni || '', nombres: docente.nombres || '',
        apellido_paterno: docente.apellido_paterno || '', apellido_materno: docente.apellido_materno || '',
        fecha_nacimiento: docente.fecha_nacimiento || '', genero: docente.genero || '',
        direccion: docente.direccion || '', telefono: docente.telefono || '', email: docente.email || '',
        especialidad: docente.especialidad || '', grado_academico: docente.grado_academico || '',
        condicion: docente.condicion || 'contratado', fecha_ingreso: docente.fecha_ingreso || '',
        activo: docente.activo
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditing) {
        await docentesService.update(id, formData);
        setMessage({ type: 'success', text: 'Docente actualizado correctamente' });
      } else {
        await docentesService.create(formData);
        setMessage({ type: 'success', text: 'Docente creado correctamente' });
        setTimeout(() => navigate('/admin/docentes'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <button onClick={() => navigate('/admin/docentes')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a docentes
      </button>

      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Docente' : 'Nuevo Docente'}</h1>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-header"><h3 className="font-semibold">Datos Personales</h3></div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">DNI *</label>
              <input type="text" value={formData.dni} maxLength="8"
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="input" required />
            </div>
            <div>
              <label className="label">Nombres *</label>
              <input type="text" value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="input" required />
            </div>
            <div>
              <label className="label">Género</label>
              <select value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="input">
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Apellido Paterno *</label>
              <input type="text" value={formData.apellido_paterno}
                onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                className="input" required />
            </div>
            <div>
              <label className="label">Apellido Materno</label>
              <input type="text" value={formData.apellido_materno}
                onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                className="input" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Fecha Nacimiento</label>
              <input type="date" value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input type="tel" value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input" />
            </div>
          </div>

          <div>
            <label className="label">Dirección</label>
            <input type="text" value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="input" />
          </div>
        </div>

        <div className="card-header border-t"><h3 className="font-semibold">Datos Profesionales</h3></div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Especialidad</label>
              <input type="text" value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="label">Grado Académico</label>
              <select value={formData.grado_academico}
                onChange={(e) => setFormData({ ...formData, grado_academico: e.target.value })}
                className="input">
                <option value="">Seleccionar...</option>
                <option value="Técnico">Técnico</option>
                <option value="Bachiller">Bachiller</option>
                <option value="Licenciado">Licenciado</option>
                <option value="Magíster">Magíster</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>
            <div>
              <label className="label">Condición</label>
              <select value={formData.condicion}
                onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                className="input">
                <option value="contratado">Contratado</option>
                <option value="nombrado">Nombrado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de Ingreso</label>
              <input type="date" value={formData.fecha_ingreso}
                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                className="input" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="activo" checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor="activo" className="text-sm text-gray-700">Docente Activo</label>
            </div>
          </div>

          {!isEditing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Cuenta de Usuario</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email para acceso</label>
                  <input type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input" placeholder="docente@ies.edu.pe" />
                </div>
                <div>
                  <label className="label">Contraseña inicial</label>
                  <input type="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input" placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">Si proporciona email y contraseña, se creará cuenta de acceso.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/admin/docentes')} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
