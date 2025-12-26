import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notasService } from '../../services/api';
import { FileText, Save, ArrowLeft, AlertCircle, CheckCircle, Lock } from 'lucide-react';

export default function RegistroNotas() {
  const { docenteUnidadId } = useParams();
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [notas, setNotas] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, [docenteUnidadId]);

  const loadData = async () => {
    try {
      const response = await notasService.getEstudiantesAsignacion(docenteUnidadId);
      setEstudiantes(response.data.data);

      // Initialize notas
      const notasInit = {};
      response.data.data.forEach(e => {
        notasInit[e.matricula_detalle_id] = e.nota_final !== null ? e.nota_final : '';
      });
      setNotas(notasInit);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar estudiantes' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotaChange = (matriculaDetalleId, value) => {
    const nota = value === '' ? '' : Math.min(20, Math.max(0, parseFloat(value) || 0));
    setNotas({ ...notas, [matriculaDetalleId]: nota });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const notasToSave = Object.entries(notas)
        .filter(([_, nota]) => nota !== '' && nota !== null)
        .map(([matricula_detalle_id, nota]) => ({
          matricula_detalle_id: parseInt(matricula_detalle_id),
          nota: parseFloat(nota)
        }));

      await notasService.registrarNotasLote(notasToSave);
      setMessage({ type: 'success', text: 'Notas guardadas correctamente' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al guardar notas' });
    } finally {
      setSaving(false);
    }
  };

  const handleCalcularFinal = async (matriculaDetalleId) => {
    try {
      const response = await notasService.calcularNotaFinal(matriculaDetalleId);
      setMessage({ type: 'success', text: `Nota final: ${response.data.data.nota_final} - ${response.data.data.estado}` });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al calcular nota' });
    }
  };

  const handleCerrarNotas = async () => {
    if (!confirm('¿Está seguro de cerrar las notas? Esta acción generará el acta y no podrá modificar las notas.')) return;

    try {
      const response = await notasService.cerrarNotas(docenteUnidadId);
      setMessage({ type: 'success', text: `Acta generada: ${response.data.data.codigo}` });
      setTimeout(() => navigate('/docente/unidades'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al cerrar notas' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
    </div>;
  }

  const allHaveNota = estudiantes.every(e => e.nota_final !== null);

  return (
    <div className="animate-fadeIn">
      <button onClick={() => navigate('/docente/unidades')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a unidades
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Registro de Notas</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Notas'}
          </button>
          {allHaveNota && (
            <button onClick={handleCerrarNotas} className="btn-secondary flex items-center gap-2">
              <Lock className="w-4 h-4" /> Cerrar Notas
            </button>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold">Lista de Estudiantes</h3>
          <span className="text-sm text-gray-500">{estudiantes.length} estudiantes</span>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Código</th>
                <th>Estudiante</th>
                <th className="text-center">Nota (0-20)</th>
                <th className="text-center">Nota Final</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No hay estudiantes matriculados</td></tr>
              ) : estudiantes.map((e, i) => (
                <tr key={e.matricula_detalle_id}>
                  <td className="text-center">{i + 1}</td>
                  <td className="font-mono text-sm">{e.codigo_estudiante}</td>
                  <td className="font-medium">{`${e.apellido_paterno} ${e.apellido_materno || ''}, ${e.nombres}`}</td>
                  <td className="text-center">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={notas[e.matricula_detalle_id] ?? ''}
                      onChange={(ev) => handleNotaChange(e.matricula_detalle_id, ev.target.value)}
                      className="input w-20 text-center"
                      disabled={e.estado_nota}
                    />
                  </td>
                  <td className="text-center">
                    {e.nota_final !== null ? (
                      <span className={`text-lg font-bold ${e.estado_nota === 'aprobado' ? 'text-green-600' : 'text-red-600'}`}>
                        {e.nota_final?.toFixed(1)}
                      </span>
                    ) : (
                      <button onClick={() => handleCalcularFinal(e.matricula_detalle_id)} className="text-sm text-primary-600 hover:underline">
                        Calcular
                      </button>
                    )}
                  </td>
                  <td className="text-center">
                    {e.estado_nota ? (
                      <span className={e.estado_nota === 'aprobado' ? 'badge-success' : 'badge-danger'}>
                        {e.estado_nota === 'aprobado' ? 'Aprobado' : 'Desaprobado'}
                      </span>
                    ) : (
                      <span className="badge-gray">Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Instrucciones</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ingrese las notas de cada estudiante (escala vigesimal: 0-20)</li>
          <li>• Haga clic en "Guardar Notas" para almacenar los cambios</li>
          <li>• Haga clic en "Calcular" para obtener la nota final de cada estudiante</li>
          <li>• Una vez todos tengan nota final, podrá cerrar las notas y generar el acta</li>
          <li>• Nota aprobatoria: 13 o más</li>
        </ul>
      </div>
    </div>
  );
}
