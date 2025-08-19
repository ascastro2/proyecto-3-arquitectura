import api from './api';
import { Turno } from '../contexts/AppContext';

export const turnosService = {
  // Obtener todos los turnos
  async getAllTurnos(): Promise<{ turnos: Turno[]; pagination: any }> {
    const response = await api.get('/agendamiento/turnos');
    return response.data.data;
  },

  // Obtener turno por ID
  async getTurnoById(id: number): Promise<Turno> {
    const response = await api.get(`/agendamiento/turnos/${id}`);
    return response.data.data;
  },

  // Crear nuevo turno
  async createTurno(turnoData: Omit<Turno, 'id' | 'createdAt' | 'updatedAt'>): Promise<Turno> {
    console.log('📤 TURNOS SERVICE - Enviando datos a /agendamiento/turnos:', {
      endpoint: '/agendamiento/turnos',
      method: 'POST',
      datos: turnoData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.post('/agendamiento/turnos', turnoData);
    
    console.log('📥 TURNOS SERVICE - Respuesta recibida:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response.data.data;
  },

  // Actualizar turno
  async updateTurno(id: number, turnoData: Partial<Turno>): Promise<Turno> {
    console.log('📤 TURNOS SERVICE - Enviando datos a /turnos/' + id + ':', {
      endpoint: `/agendamiento/turnos/${id}`,
      method: 'PUT',
      datos: turnoData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.put(`/agendamiento/turnos/${id}`, turnoData);
    
    console.log('📥 TURNOS SERVICE - Respuesta recibida:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response.data.data;
  },

  // Confirmar turno
  async confirmarTurno(id: number): Promise<Turno> {
    const response = await api.patch(`/agendamiento/turnos/${id}/confirmar`, {});
    return response.data.data;
  },

  // Cancelar turno
  async cancelarTurno(id: number, motivo: string): Promise<Turno> {
    const response = await api.patch(`/agendamiento/turnos/${id}/cancelar`, { motivo });
    return response.data.data;
  },

  // Completar turno
  async completarTurno(id: number): Promise<Turno> {
    const response = await api.patch(`/agendamiento/turnos/${id}/completar`, {});
    return response.data.data;
  },

  // Marcar como no show
  async marcarNoShow(id: number): Promise<Turno> {
    const response = await api.patch(`/agendamiento/turnos/${id}/no-show`, {});
    return response.data.data;
  },

  // Buscar disponibilidad
  async buscarDisponibilidad(medicoId: number, fecha: string): Promise<any> {
    const response = await api.get(`/agendamiento/disponibilidad?medicoId=${medicoId}&fecha=${fecha}`);
    return response.data.data;
  },

  // Obtener turnos por paciente
  async getTurnosByPaciente(pacienteId: number): Promise<Turno[]> {
    const response = await api.get(`/agendamiento/turnos?pacienteId=${pacienteId}`);
    return response.data.data.turnos;
  },

  // Obtener turnos por médico
  async getTurnosByMedico(medicoId: number): Promise<Turno[]> {
    const response = await api.get(`/agendamiento/turnos?medicoId=${medicoId}`);
    return response.data.data.turnos;
  },
};
