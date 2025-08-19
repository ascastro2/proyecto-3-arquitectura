import api from './api';
import { Paciente } from '../contexts/AppContext';

export const pacientesService = {
  // Obtener todos los pacientes
  async getAllPacientes(): Promise<Paciente[]> {
    const response = await api.get('/pacientes');
    return response.data.data;
  },

  // Obtener paciente por ID
  async getPacienteById(id: number): Promise<Paciente> {
    const response = await api.get(`/pacientes/${id}`);
    return response.data.data;
  },

  // Obtener paciente por DNI
  async getPacienteByDNI(dni: string): Promise<Paciente> {
    const response = await api.get(`/pacientes/dni/${dni}`);
    return response.data.data;
  },

  // Crear nuevo paciente
  async createPaciente(pacienteData: Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Paciente> {
    console.log('📤 PACIENTES SERVICE - Enviando datos a /pacientes:', {
      endpoint: '/pacientes',
      method: 'POST',
      datos: pacienteData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.post('/pacientes', pacienteData);
    
    console.log('📥 PACIENTES SERVICE - Respuesta recibida:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response.data.data;
  },

  // Actualizar paciente
  async updatePaciente(id: number, pacienteData: Partial<Paciente>): Promise<Paciente> {
    console.log('📤 PACIENTES SERVICE - Enviando datos a /pacientes/' + id + ':', {
      endpoint: `/pacientes/${id}`,
      method: 'PUT',
      datos: pacienteData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.put(`/pacientes/${id}`, pacienteData);
    
    console.log('📥 PACIENTES SERVICE - Respuesta recibida:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response.data.data;
  },

  // Eliminar paciente
  async deletePaciente(id: number): Promise<void> {
    console.log('🗑️ PACIENTES SERVICE - Eliminando paciente ID:', {
      endpoint: `/pacientes/${id}`,
      method: 'DELETE',
      id: id,
      timestamp: new Date().toISOString()
    });
    
    await api.delete(`/pacientes/${id}`);
    
    console.log('✅ PACIENTES SERVICE - Paciente eliminado exitosamente');
  },

  // Buscar pacientes
  async searchPacientes(query: string): Promise<Paciente[]> {
    const response = await api.get(`/pacientes?search=${query}`);
    return response.data.data;
  },
};
