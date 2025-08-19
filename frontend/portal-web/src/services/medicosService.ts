import api from './api';
import { Medico } from '../contexts/AppContext';

export const medicosService = {
  // Obtener todos los médicos
  async getAllMedicos(): Promise<Medico[]> {
    const response = await api.get('/medicos');
    return response.data.data;
  },

  // Obtener médico por ID
  async getMedicoById(id: number): Promise<Medico> {
    const response = await api.get(`/medicos/${id}`);
    return response.data.data;
  },

  // Crear nuevo médico
  async createMedico(medicoData: Omit<Medico, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medico> {
    console.log('📤 MÉDICOS SERVICE - Enviando datos a /medicos:', {
      endpoint: '/medicos',
      method: 'POST',
      datos: medicoData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.post('/medicos', medicoData);
    
    console.log('📥 MÉDICOS SERVICE - Respuesta recibida:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response.data.data;
  },

  // Actualizar médico
  async updateMedico(id: number, medicoData: Partial<Medico>): Promise<Medico> {
    console.log('📤 MÉDICOS SERVICE - Enviando datos a /medicos/' + id + ':', {
      endpoint: `/medicos/${id}`,
      method: 'PUT',
      datos: medicoData,
      timestamp: new Date().toISOString()
    });
    
    const response = await api.put(`/medicos/${id}`, medicoData);
    
    console.log('📥 MÉDICOS SERVICE - Respuesta recibida:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
    return response.data.data;
  },

  // Eliminar médico (soft delete)
  async deleteMedico(id: number): Promise<void> {
    console.log('🗑️ MÉDICOS SERVICE - Eliminando médico ID:', {
      endpoint: `/medicos/${id}`,
      method: 'DELETE',
      id: id,
      timestamp: new Date().toISOString()
    });
    
    await api.delete(`/medicos/${id}`);
    
    console.log('✅ MÉDICOS SERVICE - Médico eliminado exitosamente');
  },

  // Buscar médicos por especialidad
  async getMedicosByEspecialidad(especialidad: string): Promise<Medico[]> {
    const response = await api.get(`/medicos?especialidad=${especialidad}`);
    return response.data.data;
  },
};
