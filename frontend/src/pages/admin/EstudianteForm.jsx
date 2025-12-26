import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { estudiantesService, institucionService } from '../../services/api';
import { Users, ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function EstudianteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    codigo_estudiante: '', dni: '', nombres: '', apellido_paterno: '', apellido_materno: '',
    fecha_nacimiento: '', genero: '', direccion: '', telefono: '', email: '',
    programa_id: '', plan_estudio_id: '', turno_id: '', ciclo_actual: 1,
    estado: 'activo', fecha_ingreso: '', password: ''
  });
  const [programas, setProgramas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [programasRes, turnosRes] = await Promise.all([
        institucionService.getProgramas(),
        institucionService.getTurnos()
      ]);
      setProgramas(programasRes.data.data);
      setTurnos(turnosRes.data.data);

      if (isEditing) {
        const estudianteRes = await estudiantesService.getById(id);
        const estudiante = estudianteRes.data.data;
        setFormData({
          codigo_estudiante: estudiante.codigo_estudiante || '',
          dni: estudiante.dni || '',
          nombres: estudiante.nombres || '',
          apellido_paterno: estudiante.apellido_paterno || '',
          apellido_materno: estudiante.apellido_materno || '',
          fecha_nacimiento: estudiante.fecha_nacimiento || '',
          genero: estudiante.genero || '',
          direccion: estudiante.direccion || '',
          telefono: estudiante.telefono || '',
          email: estudiante.email || '',
          programa_id: estudiante.programa_id || '',
          plan_estudio_id: estudiante.plan_estudio_id || '',
          turno_id: estudiante.turno_id || '',
          ciclo_actual: estudiante.ciclo_actual || 1,
          estado: estudiante.estado || 'activo',
          fecha_ingreso: estudiante.fecha_ingreso || ''
        });
        if (estudiante.programa_id) {
          const planesRes = await institucionService.getPlanes(estudiante.programa_id);
          setPlanes(planesRes.data.data);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleProgramaChange = async (programaId) => {
    setFormData({ ...formData, programa_id: programaId, plan_estudio_id: '' });
    if (programaId) {
      try {
        const response = await institucionService.getPlanes(programaId);
        setPlanes(response.data.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setPlanes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditing) {
        await estudiantesService.update(id, formData);
        setMessage({ type: 'success', text: 'Estudiante actualizado correctamente' });
      } else {
        await estudiantesService.create(formData);
        setMessage({ type: 'success', text: 'Estudiante creado correctamente' });
        setTimeout(() => navigate('/admin/estudiantes'), 1500);
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
      <button onClick={() => navigate('/admin/estudiantes')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a estudiantes
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h1>
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
              <label className="label">Código Estudiante *</label>
              <input type="text" value={formData.codigo_estudiante}
                onChange={(e) => setFormData({ ...formData, codigo_estudiante: e.target.value })}
                className="input" required disabled={isEditing} />
            </div>
            <div>
              <label className="label">DNI *</label>
              <input type="text" value={formData.dni} maxLength="8"
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nombres *</label>
              <input type="text" value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="input" required />
            </div>
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
              <label className="label">Correo Electrónico</label>
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

        <div className="card-header border-t"><h3 className="font-semibold">Datos Académicos</h3></div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Programa de Estudio</label>
              <select value={formData.programa_id}
                onChange={(e) => handleProgramaChange(e.target.value)}
                className="input">
                <option value="">Seleccionar...</option>
                {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Plan de Estudio</label>
              <select value={formData.plan_estudio_id}
                onChange={(e) => setFormData({ ...formData, plan_estudio_id: e.target.value })}
                className="input" disabled={!formData.programa_id}>
                <option value="">Seleccionar...</option>
                {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Turno</label>
              <select value={formData.turno_id}
                onChange={(e) => setFormData({ ...formData, turno_id: e.target.value })}
                className="input">
                <option value="">Seleccionar...</option>
                {turnos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Ciclo Actual</label>
              <input type="number" value={formData.ciclo_actual} min="1" max="12"
                onChange={(e) => setFormData({ ...formData, ciclo_actual: parseInt(e.target.value) })}
                className="input" />
            </div>
            <div>
              <label className="label">Estado</label>
              <select value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="input">
                <option value="activo">Activo</option>
                <option value="egresado">Egresado</option>
                <option value="retirado">Retirado</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
            <div>
              <label className="label">Fecha de Ingreso</label>
              <input type="date" value={formData.fecha_ingreso}
                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                className="input" />
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
                    className="input" placeholder="estudiante@ies.edu.pe" />
                </div>
                <div>
                  <label className="label">Contraseña inicial</label>
                  <input type="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input" placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">Si proporciona email y contraseña, se creará una cuenta de acceso para el estudiante.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => navigate('/admin/estudiantes')} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
