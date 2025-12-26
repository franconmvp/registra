import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  toggleUserStatus: (id) => api.patch(`/auth/users/${id}/toggle-status`),
  resetPassword: (id, newPassword) => api.put(`/auth/users/${id}/reset-password`, { newPassword }),
};

// Institución
export const institucionService = {
  get: () => api.get('/institucion'),
  update: (data) => api.put('/institucion', data),
  
  // Periodos
  getPeriodos: () => api.get('/institucion/periodos'),
  getPeriodoActivo: () => api.get('/institucion/periodos/activo'),
  createPeriodo: (data) => api.post('/institucion/periodos', data),
  updatePeriodo: (id, data) => api.put(`/institucion/periodos/${id}`, data),
  deletePeriodo: (id) => api.delete(`/institucion/periodos/${id}`),
  
  // Turnos
  getTurnos: () => api.get('/institucion/turnos'),
  createTurno: (data) => api.post('/institucion/turnos', data),
  updateTurno: (id, data) => api.put(`/institucion/turnos/${id}`, data),
  
  // Programas
  getProgramas: () => api.get('/institucion/programas'),
  getPrograma: (id) => api.get(`/institucion/programas/${id}`),
  createPrograma: (data) => api.post('/institucion/programas', data),
  updatePrograma: (id, data) => api.put(`/institucion/programas/${id}`, data),
  
  // Planes
  getPlanes: (programaId) => api.get('/institucion/planes', { params: { programa_id: programaId } }),
  getPlan: (id) => api.get(`/institucion/planes/${id}`),
  createPlan: (data) => api.post('/institucion/planes', data),
  updatePlan: (id, data) => api.put(`/institucion/planes/${id}`, data),
  
  // Unidades
  getUnidades: (params) => api.get('/institucion/unidades', { params }),
  createUnidad: (data) => api.post('/institucion/unidades', data),
  updateUnidad: (id, data) => api.put(`/institucion/unidades/${id}`, data),
  
  // Reglas promoción
  getReglas: (params) => api.get('/institucion/reglas-promocion', { params }),
  createRegla: (data) => api.post('/institucion/reglas-promocion', data),
  updateRegla: (id, data) => api.put(`/institucion/reglas-promocion/${id}`, data),
  deleteRegla: (id) => api.delete(`/institucion/reglas-promocion/${id}`),
};

// Estudiantes
export const estudiantesService = {
  getAll: (params) => api.get('/estudiantes', { params }),
  getById: (id) => api.get(`/estudiantes/${id}`),
  create: (data) => api.post('/estudiantes', data),
  update: (id, data) => api.put(`/estudiantes/${id}`, data),
  getHistorial: (id) => api.get(`/estudiantes/${id}/historial`),
  
  // Para estudiante logueado
  getMiPerfil: () => api.get('/estudiantes/mi/perfil'),
  getMiHistorial: () => api.get('/estudiantes/mi/historial'),
  getMisMatriculas: () => api.get('/estudiantes/mi/matriculas'),
};

// Docentes
export const docentesService = {
  getAll: (params) => api.get('/docentes', { params }),
  getById: (id) => api.get(`/docentes/${id}`),
  create: (data) => api.post('/docentes', data),
  update: (id, data) => api.put(`/docentes/${id}`, data),
  
  // Asignaciones
  getAsignaciones: (params) => api.get('/docentes/asignaciones/list', { params }),
  asignarUnidad: (data) => api.post('/docentes/asignaciones', data),
  eliminarAsignacion: (id) => api.delete(`/docentes/asignaciones/${id}`),
  
  // Horarios
  getHorarios: (params) => api.get('/docentes/horarios/list', { params }),
  createHorario: (data) => api.post('/docentes/horarios', data),
  updateHorario: (id, data) => api.put(`/docentes/horarios/${id}`, data),
  deleteHorario: (id) => api.delete(`/docentes/horarios/${id}`),
  
  // Personal no docente
  getPersonalNoDocente: () => api.get('/docentes/personal-no-docente/list'),
  createPersonalNoDocente: (data) => api.post('/docentes/personal-no-docente', data),
  updatePersonalNoDocente: (id, data) => api.put(`/docentes/personal-no-docente/${id}`, data),
  
  // Para docente logueado
  getMisAsignaciones: () => api.get('/docentes/mi/asignaciones'),
};

// Matrícula
export const matriculaService = {
  // Prematrículas
  getPrematriculas: (params) => api.get('/matricula/prematriculas', { params }),
  getPrematricula: (id) => api.get(`/matricula/prematriculas/${id}`),
  createPrematricula: (data) => api.post('/matricula/prematriculas', data),
  updateEstadoPrematricula: (id, data) => api.patch(`/matricula/prematriculas/${id}/estado`, data),
  
  // Matrículas
  getAll: (params) => api.get('/matricula', { params }),
  getById: (id) => api.get(`/matricula/${id}`),
  create: (data) => api.post('/matricula', data),
  matricularDesdePrematricula: (prematriculaId, data) => 
    api.post(`/matricula/desde-prematricula/${prematriculaId}`, data),
  updateEstado: (id, data) => api.patch(`/matricula/${id}/estado`, data),
  getEstadisticas: (periodoId) => api.get('/matricula/estadisticas', { params: { periodo_id: periodoId } }),
  getUnidadesDisponibles: (estudianteId, periodoId) => 
    api.get('/matricula/unidades-disponibles', { params: { estudiante_id: estudianteId, periodo_id: periodoId } }),
};

// Notas
export const notasService = {
  getMisUnidades: () => api.get('/notas/mis-unidades'),
  getEstudiantesAsignacion: (docenteUnidadId) => 
    api.get(`/notas/asignacion/${docenteUnidadId}/estudiantes`),
  getCriterios: (docenteUnidadId) => api.get(`/notas/asignacion/${docenteUnidadId}/criterios`),
  saveCriterios: (docenteUnidadId, criterios) => 
    api.post(`/notas/asignacion/${docenteUnidadId}/criterios`, { criterios }),
  getNotasEstudiante: (matriculaDetalleId) => api.get(`/notas/estudiante/${matriculaDetalleId}`),
  registrarNota: (data) => api.post('/notas/registrar', data),
  registrarNotasLote: (notas) => api.post('/notas/registrar-lote', { notas }),
  calcularNotaFinal: (matriculaDetalleId) => api.post(`/notas/calcular-final/${matriculaDetalleId}`),
  cerrarNotas: (docenteUnidadId) => api.post(`/notas/cerrar/${docenteUnidadId}`),
  getActas: (params) => api.get('/notas/actas', { params }),
  getActaDetalle: (id) => api.get(`/notas/actas/${id}`),
};

// Reportes
export const reportesService = {
  getDashboard: () => api.get('/reportes/dashboard'),
  getReporteMatricula: (periodoId) => 
    api.get('/reportes/matricula-semestral', { params: { periodo_id: periodoId } }),
  getReporteNotas: (periodoId, programaId) => 
    api.get('/reportes/notas-periodo', { params: { periodo_id: periodoId, programa_id: programaId } }),
  getActasPendientes: (periodoId) => 
    api.get('/reportes/actas-pendientes', { params: { periodo_id: periodoId } }),
  getCertificados: (params) => api.get('/reportes/certificados', { params }),
  generarCertificadoEstudios: (estudianteId) => 
    api.post(`/reportes/certificado-estudios/${estudianteId}`),
  getConstanciaMatricula: (matriculaId) => 
    api.get(`/reportes/constancia-matricula/${matriculaId}`),
};

export default api;
