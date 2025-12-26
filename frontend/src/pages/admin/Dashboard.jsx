import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportesService } from '../../services/api';
import { 
  Users, UserCheck, BookOpen, ClipboardList, TrendingUp, Calendar,
  ArrowRight, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1e3a5f', '#d4a84b', '#2d508a', '#c49a3e', '#3f6ea7'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await reportesService.getDashboard();
      setData(response.data.data);
    } catch (err) {
      setError('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const stats = [
    { label: 'Estudiantes Activos', value: data?.resumen?.estudiantes || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Docentes', value: data?.resumen?.docentes || 0, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Programas', value: data?.resumen?.programas || 0, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Matrículas Activas', value: data?.resumen?.matriculasActivas || 0, icon: ClipboardList, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido al Sistema de Gestión Educativa</p>
        </div>
        {data?.periodoActivo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-800 rounded-lg">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Periodo: {data.periodoActivo.nombre}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matrículas por Programa */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-800">Matrículas por Programa</h3>
          </div>
          <div className="card-body">
            {data?.estadisticasMatricula?.porPrograma?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.estadisticasMatricula.porPrograma}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="total" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Matrículas por Ciclo */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-800">Distribución por Ciclo</h3>
          </div>
          <div className="card-body">
            {data?.estadisticasMatricula?.porCiclo?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.estadisticasMatricula.porCiclo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ ciclo, total, percent }) => `Ciclo ${ciclo}: ${total} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {data.estadisticasMatricula.porCiclo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-800">Acciones Rápidas</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/matriculas/nueva" className="flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-800">Nueva Matrícula</span>
              </div>
              <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/admin/estudiantes/nuevo" className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Nuevo Estudiante</span>
              </div>
              <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/admin/docentes/nuevo" className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Nuevo Docente</span>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/admin/reportes/matriculas" className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">Ver Reportes</span>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
