import api from './api';

export interface Notificacion {
  id: number;
  tipo: string;
  destinatario: string;
  asunto: string;
  contenido: string;
  canal: 'EMAIL' | 'SMS';
  estado: 'PENDIENTE' | 'ENVIADO' | 'ERROR';
  fecha_envio: string;
  fecha_entrega?: string;
  intentos: number;
  error_mensaje?: string;
  created_at: string;
  updated_at: string;
  pacienteId?: number;
  medicoId?: number;
  turnoId?: number;
}

export interface Plantilla {
  id: number;
  nombre: string;
  tipo: string;
  canal: 'EMAIL' | 'SMS';
  asunto?: string;
  contenido: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasNotificaciones {
  total: number;
  pendientes: number;
  enviadas: number;
  errores: number;
  porTipo: Record<string, number>;
  porCanal: Record<string, number>;
}

export interface EstadisticasPlantillas {
  total: number;
  activas: number;
  inactivas: number;
  porTipo: Record<string, number>;
  porCanal: Record<string, number>;
}

// Servicio de Notificaciones
export const notificacionesService = {
  // Obtener todas las notificaciones
  async getAllNotificaciones(): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo todas las notificaciones');
    const response = await api.get('/notificaciones');
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificación por ID
  async getNotificacionById(id: number): Promise<{ success: boolean; data: Notificacion }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificación ID:', id);
    const response = await api.get(`/notificaciones/${id}`);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Buscar notificaciones
  async searchNotificaciones(query: string): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Buscando notificaciones con query:', query);
    const response = await api.get('/notificaciones/search', { params: { q: query } });
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificaciones pendientes
  async getNotificacionesPendientes(): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificaciones pendientes');
    const response = await api.get('/notificaciones/pendientes');
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificaciones por tipo
  async getNotificacionesByTipo(tipo: string): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificaciones por tipo:', tipo);
    const response = await api.get(`/notificaciones/tipo/${tipo}`);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificaciones por canal
  async getNotificacionesByCanal(canal: string): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificaciones por canal:', canal);
    const response = await api.get(`/notificaciones/canal/${canal}`);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificaciones por estado
  async getNotificacionesByEstado(estado: string): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificaciones por estado:', estado);
    const response = await api.get(`/notificaciones/estado/${estado}`);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificaciones por paciente
  async getNotificacionesByPaciente(pacienteId: number): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificaciones por paciente ID:', pacienteId);
    const response = await api.get(`/notificaciones/paciente/${pacienteId}`);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificaciones por médico
  async getNotificacionesByMedico(medicoId: number): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificaciones por médico ID:', medicoId);
    const response = await api.get(`/notificaciones/medico/${medicoId}`);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener notificaciones por turno
  async getNotificacionesByTurno(turnoId: number): Promise<{ success: boolean; data: Notificacion[] }> {
    console.log('📧 NOTIFICACIONES - Obteniendo notificaciones por turno ID:', turnoId);
    const response = await api.get(`/notificaciones/turno/${turnoId}`);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener estadísticas
  async getEstadisticas(): Promise<{ success: boolean; data: EstadisticasNotificaciones }> {
    console.log('📧 NOTIFICACIONES - Obteniendo estadísticas');
    const response = await api.get('/notificaciones/estadisticas');
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Enviar notificación
  async enviarNotificacion(notificacion: Partial<Notificacion>): Promise<{ success: boolean; data: Notificacion }> {
    console.log('📧 NOTIFICACIONES - Enviando notificación:', notificacion);
    const response = await api.post('/notificaciones/enviar', notificacion);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Enviar confirmación de cita
  async enviarConfirmacionCita(data: { pacienteId: number; medicoId: number; turnoId: number; fecha: string; hora: string }): Promise<{ success: boolean; data: Notificacion }> {
    console.log('📧 NOTIFICACIONES - Enviando confirmación de cita:', data);
    const response = await api.post('/notificaciones/confirmacion-cita', data);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Enviar modificación de cita
  async enviarModificacionCita(data: { pacienteId: number; medicoId: number; turnoId: number; fecha: string; hora: string; motivo: string }): Promise<{ success: boolean; data: Notificacion }> {
    console.log('📧 NOTIFICACIONES - Enviando modificación de cita:', data);
    const response = await api.post('/notificaciones/modificacion-cita', data);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Enviar cancelación de cita
  async enviarCancelacionCita(data: { pacienteId: number; medicoId: number; turnoId: number; motivo: string }): Promise<{ success: boolean; data: Notificacion }> {
    console.log('📧 NOTIFICACIONES - Enviando cancelación de cita:', data);
    const response = await api.post('/notificaciones/cancelacion-cita', data);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  },

  // Enviar recordatorio de cita
  async enviarRecordatorioCita(data: { pacienteId: number; medicoId: number; turnoId: number; fecha: string; hora: string }): Promise<{ success: boolean; data: Notificacion }> {
    console.log('📧 NOTIFICACIONES - Enviando recordatorio de cita:', data);
    const response = await api.post('/notificaciones/recordatorio-cita', data);
    console.log('📧 NOTIFICACIONES - Respuesta del backend:', response.data);
    return response.data;
  }
};

// Servicio de Plantillas
export const plantillasService = {
  // Obtener todas las plantillas
  async getAllPlantillas(): Promise<{ success: boolean; data: Plantilla[] }> {
    console.log('📧 PLANTILLAS - Obteniendo todas las plantillas');
    const response = await api.get('/notificaciones/plantillas');
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener plantillas activas
  async getPlantillasActivas(): Promise<{ success: boolean; data: Plantilla[] }> {
    console.log('📧 PLANTILLAS - Obteniendo plantillas activas');
    const response = await api.get('/notificaciones/plantillas/activas');
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener plantilla por ID
  async getPlantillaById(id: number): Promise<{ success: boolean; data: Plantilla }> {
    console.log('📧 PLANTILLAS - Obteniendo plantilla ID:', id);
    const response = await api.get(`/notificaciones/plantillas/${id}`);
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Buscar plantillas
  async searchPlantillas(query: string): Promise<{ success: boolean; data: Plantilla[] }> {
    console.log('📧 PLANTILLAS - Buscando plantillas con query:', query);
    const response = await api.get('/notificaciones/plantillas/search', { params: { q: query } });
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Obtener estadísticas de plantillas
  async getEstadisticas(): Promise<{ success: boolean; data: EstadisticasPlantillas }> {
    console.log('📧 PLANTILLAS - Obteniendo estadísticas de plantillas');
    const response = await api.get('/notificaciones/plantillas/estadisticas');
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Crear plantilla
  async createPlantilla(plantilla: Partial<Plantilla>): Promise<{ success: boolean; data: Plantilla }> {
    console.log('📧 PLANTILLAS - Creando plantilla:', plantilla);
    const response = await api.post('/notificaciones/plantillas', plantilla);
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Actualizar plantilla
  async updatePlantilla(id: number, plantilla: Partial<Plantilla>): Promise<{ success: boolean; data: Plantilla }> {
    console.log('📧 PLANTILLAS - Actualizando plantilla ID:', id, plantilla);
    const response = await api.put(`/notificaciones/plantillas/${id}`, plantilla);
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Eliminar plantilla
  async deletePlantilla(id: number): Promise<{ success: boolean; message: string }> {
    console.log('📧 PLANTILLAS - Eliminando plantilla ID:', id);
    const response = await api.delete(`/notificaciones/plantillas/${id}`);
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Activar plantilla
  async activatePlantilla(id: number): Promise<{ success: boolean; data: Plantilla }> {
    console.log('📧 PLANTILLAS - Activando plantilla ID:', id);
    const response = await api.patch(`/notificaciones/plantillas/${id}/activar`);
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  },

  // Desactivar plantilla
  async deactivatePlantilla(id: number): Promise<{ success: boolean; data: Plantilla }> {
    console.log('📧 PLANTILLAS - Desactivando plantilla ID:', id);
    const response = await api.patch(`/notificaciones/plantillas/${id}/desactivar`);
    console.log('📧 PLANTILLAS - Respuesta del backend:', response.data);
    return response.data;
  }
};
