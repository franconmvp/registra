import { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import { Settings, Plus, UserCheck, UserX, Key, AlertCircle } from 'lucide-react';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', rol: 'estudiante' });
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await authService.getUsers();
      setUsuarios(response.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.createUser(formData);
      setMessage({ type: 'success', text: 'Usuario creado exitosamente' });
      loadData();
      setShowForm(false);
      setFormData({ email: '', password: '', rol: 'estudiante' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al crear usuario' });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await authService.toggleUserStatus(id);
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al cambiar estado' });
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    try {
      await authService.resetPassword(showResetPassword, newPassword);
      setMessage({ type: 'success', text: 'Contraseña reseteada exitosamente' });
      setShowResetPassword(null);
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al resetear contraseña' });
    }
  };

  const getRolBadge = (rol) => {
    switch (rol) {
      case 'administrador': return <span className="badge bg-purple-100 text-purple-800">Administrador</span>;
      case 'docente': return <span className="badge bg-blue-100 text-blue-800">Docente</span>;
      case 'estudiante': return <span className="badge bg-green-100 text-green-800">Estudiante</span>;
      default: return <span className="badge-gray">{rol}</span>;
    }
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
          <Settings className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle className="w-5 h-5" /> {message.text}
        </div>
      )}

      {/* Create User Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b"><h2 className="text-xl font-semibold">Nuevo Usuario</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Contraseña *</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" required minLength={6} />
              </div>
              <div>
                <label className="label">Rol *</label>
                <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="input" required>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-primary">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b"><h2 className="text-xl font-semibold">Resetear Contraseña</h2></div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Nueva Contraseña *</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { setShowResetPassword(null); setNewPassword(''); }} className="btn-ghost">Cancelar</button>
                <button onClick={handleResetPassword} className="btn-primary">Resetear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Email</th><th>Rol</th><th>Estado</th><th>Fecha Creación</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.email}</td>
                  <td>{getRolBadge(u.rol)}</td>
                  <td>{u.activo ? <span className="badge-success">Activo</span> : <span className="badge-danger">Inactivo</span>}</td>
                  <td className="text-sm">{u.created_at?.split('T')[0]}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleStatus(u.id)} className={`p-2 rounded-lg ${u.activo ? 'text-gray-600 hover:text-red-600 hover:bg-red-50' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'}`} title={u.activo ? 'Desactivar' : 'Activar'}>
                        {u.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setShowResetPassword(u.id)} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg" title="Resetear contraseña">
                        <Key className="w-4 h-4" />
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
