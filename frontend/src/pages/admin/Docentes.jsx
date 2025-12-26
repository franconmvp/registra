import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { docentesService } from '../../services/api';
import { UserCheck, Plus, Edit, Search, AlertCircle } from 'lucide-react';

export default function Docentes() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await docentesService.getAll({ search });
      setDocentes(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar docentes' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    await loadData();
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Personal Docente</h1>
        </div>
        <Link to="/admin/docentes/nuevo" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Docente
        </Link>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle className="w-5 h-5" /> {message.text}
        </div>
      )}

      <div className="card mb-6">
        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Buscar por nombre o DNI..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10" />
            </div>
            <button onClick={handleSearch} className="btn-primary">Buscar</button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>DNI</th><th>Docente</th><th>Especialidad</th><th>Condición</th><th>Email</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {docentes.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-gray-500">No hay docentes registrados</td></tr>
                ) : docentes.map((d) => (
                  <tr key={d.id}>
                    <td>{d.dni}</td>
                    <td className="font-medium">{`${d.apellido_paterno} ${d.apellido_materno || ''}, ${d.nombres}`}</td>
                    <td>{d.especialidad || '-'}</td>
                    <td><span className={d.condicion === 'nombrado' ? 'badge-info' : 'badge-gray'}>{d.condicion}</span></td>
                    <td className="text-sm">{d.email || '-'}</td>
                    <td>{d.activo ? <span className="badge-success">Activo</span> : <span className="badge-gray">Inactivo</span>}</td>
                    <td>
                      <Link to={`/admin/docentes/${d.id}`} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg inline-block">
                        <Edit className="w-4 h-4" />
                      </Link>
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
