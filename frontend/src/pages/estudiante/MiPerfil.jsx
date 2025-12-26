import { useState, useEffect } from 'react';
import { estudiantesService } from '../../services/api';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, AlertCircle } from 'lucide-react';

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await estudiantesService.getMiPerfil();
      setPerfil(response.data.data);
    } catch (err) {
      setError('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
      <AlertCircle className="w-5 h-5" /> {error}
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo & Basic Info */}
        <div className="card">
          <div className="card-body text-center">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-16 h-16 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {perfil?.nombres}
            </h2>
            <p className="text-gray-600">{perfil?.apellido_paterno} {perfil?.apellido_materno}</p>
            <div className="mt-4">
              <span className={`badge ${perfil?.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>
                {perfil?.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Datos Personales</h3></div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-mono text-sm">DNI</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Documento</p>
                    <p className="font-medium">{perfil?.dni}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha Nacimiento</p>
                    <p className="font-medium">{perfil?.fecha_nacimiento || 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{perfil?.email || 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{perfil?.telefono || 'No registrado'}</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{perfil?.direccion || 'No registrado'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="font-semibold">Datos Académicos</h3></div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-mono text-sm">COD</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Código Estudiante</p>
                    <p className="font-medium">{perfil?.codigo_estudiante}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Programa</p>
                    <p className="font-medium">{perfil?.programa_nombre || 'No asignado'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Plan de Estudio</p>
                  <p className="font-medium">{perfil?.plan_nombre || 'No asignado'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Turno</p>
                  <p className="font-medium">{perfil?.turno_nombre || 'No asignado'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Ciclo Actual</p>
                  <p className="font-medium text-lg">{perfil?.ciclo_actual || 1}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                  <p className="font-medium">{perfil?.fecha_ingreso || 'No registrado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
        <strong>Nota:</strong> Si necesita actualizar algún dato de su perfil, por favor contacte a la oficina de administración.
      </div>
    </div>
  );
}
