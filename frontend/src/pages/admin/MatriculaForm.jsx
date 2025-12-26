import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matriculaService, estudiantesService, institucionService } from '../../services/api';
import { ClipboardList, ArrowLeft, Save, AlertCircle, CheckCircle, Search } from 'lucide-react';

export default function MatriculaForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [formData, setFormData] = useState({
    estudiante_id: '', periodo_id: '', ciclo: 1, turno_id: '', condicion: 'regular', unidades: [], observaciones: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [periodosRes, turnosRes] = await Promise.all([
        institucionService.getPeriodos(),
        institucionService.getTurnos()
      ]);
      setPeriodos(periodosRes.data.data);
      setTurnos(turnosRes.data.data);

      const periodoActivo = periodosRes.data.data.find(p => p.activo);
      if (periodoActivo) {
        setFormData(prev => ({ ...prev, periodo_id: periodoActivo.id }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEstudiantes = async () => {
    if (!search) return;
    try {
      const response = await estudiantesService.getAll({ search, estado: 'activo' });
      setEstudiantes(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al buscar estudiantes' });
    }
  };

  const handleSelectEstudiante = async (estudiante) => {
    setSelectedEstudiante(estudiante);
    setFormData(prev => ({
      ...prev,
      estudiante_id: estudiante.id,
      ciclo: estudiante.ciclo_actual || 1,
      turno_id: estudiante.turno_id || ''
    }));

    try {
      const response = await matriculaService.getUnidadesDisponibles(estudiante.id, formData.periodo_id);
      setUnidadesDisponibles(response.data.data.unidades || []);
    } catch (err) {
      console.error(err);
    }
    setStep(2);
  };

  const handleToggleUnidad = (unidadId) => {
    const current = formData.unidades;
    const exists = current.find(u => u.unidad_didactica_id === unidadId);
    if (exists) {
      setFormData({ ...formData, unidades: current.filter(u => u.unidad_didactica_id !== unidadId) });
    } else {
      setFormData({ ...formData, unidades: [...current, { unidad_didactica_id: unidadId, numero_vez: 1 }] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.unidades.length === 0) {
      setMessage({ type: 'error', text: 'Debe seleccionar al menos una unidad didáctica' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await matriculaService.create(formData);
      setMessage({ type: 'success', text: 'Matrícula creada exitosamente' });
      setTimeout(() => navigate('/admin/matriculas'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al crear matrícula' });
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
      <button onClick={() => navigate('/admin/matriculas')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a matrículas
      </button>

      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">Nueva Matrícula</h1>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-800' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-800 text-white' : 'bg-gray-200'}`}>1</span>
          <span className="font-medium">Estudiante</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-800' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-800 text-white' : 'bg-gray-200'}`}>2</span>
          <span className="font-medium">Unidades</span>
        </div>
      </div>

      {step === 1 && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold">Buscar Estudiante</h3></div>
          <div className="card-body">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Buscar por nombre, código o DNI..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchEstudiantes()}
                  className="input pl-10" />
              </div>
              <button onClick={handleSearchEstudiantes} className="btn-primary">Buscar</button>
            </div>

            {estudiantes.length > 0 && (
              <div className="space-y-2">
                {estudiantes.map(e => (
                  <div key={e.id} onClick={() => handleSelectEstudiante(e)}
                    className="p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{`${e.apellido_paterno} ${e.apellido_materno || ''}, ${e.nombres}`}</p>
                        <p className="text-sm text-gray-500">{e.codigo_estudiante} | DNI: {e.dni}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{e.programa_nombre}</p>
                        <p className="text-xs text-gray-500">Ciclo {e.ciclo_actual || 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && selectedEstudiante && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold">Estudiante Seleccionado</h3>
              <button type="button" onClick={() => { setStep(1); setSelectedEstudiante(null); }} className="text-sm text-primary-600 hover:underline">Cambiar</button>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><span className="text-gray-500 text-sm">Código</span><p className="font-medium">{selectedEstudiante.codigo_estudiante}</p></div>
                <div><span className="text-gray-500 text-sm">Nombre</span><p className="font-medium">{`${selectedEstudiante.apellido_paterno} ${selectedEstudiante.apellido_materno || ''}, ${selectedEstudiante.nombres}`}</p></div>
                <div><span className="text-gray-500 text-sm">DNI</span><p className="font-medium">{selectedEstudiante.dni}</p></div>
                <div><span className="text-gray-500 text-sm">Programa</span><p className="font-medium">{selectedEstudiante.programa_nombre}</p></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Datos de Matrícula</h3></div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">Periodo *</label>
                  <select value={formData.periodo_id} onChange={(e) => setFormData({ ...formData, periodo_id: e.target.value })} className="input" required>
                    {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Ciclo *</label>
                  <input type="number" value={formData.ciclo} onChange={(e) => setFormData({ ...formData, ciclo: parseInt(e.target.value) })} className="input" min="1" max="12" required />
                </div>
                <div>
                  <label className="label">Turno</label>
                  <select value={formData.turno_id} onChange={(e) => setFormData({ ...formData, turno_id: e.target.value })} className="input">
                    <option value="">Seleccionar...</option>
                    {turnos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Condición</label>
                  <select value={formData.condicion} onChange={(e) => setFormData({ ...formData, condicion: e.target.value })} className="input">
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                    <option value="repitente">Repitente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Seleccionar Unidades Didácticas</h3></div>
            <div className="card-body">
              {unidadesDisponibles.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay unidades disponibles o el estudiante no tiene plan asignado</p>
              ) : (
                <div className="space-y-2">
                  {unidadesDisponibles.map(u => (
                    <label key={u.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.unidades.find(x => x.unidad_didactica_id === u.id) ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                    }`}>
                      <input type="checkbox" checked={!!formData.unidades.find(x => x.unidad_didactica_id === u.id)}
                        onChange={() => handleToggleUnidad(u.id)}
                        className="w-4 h-4 text-primary-600 rounded" />
                      <div className="flex-1">
                        <p className="font-medium">{u.nombre}</p>
                        <p className="text-sm text-gray-500">{u.codigo} | Ciclo {u.ciclo} | {u.creditos} créditos</p>
                      </div>
                      {u.veces_cursado > 0 && <span className="badge-warning">Vez {u.veces_cursado + 1}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/admin/matriculas')} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Crear Matrícula'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
