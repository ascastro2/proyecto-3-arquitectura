const MedicoRepository = require('../repositories/MedicoRepository');
const DisponibilidadRepository = require('../repositories/DisponibilidadRepository');
const Medico = require('../models/Medico');
const Disponibilidad = require('../models/Disponibilidad');

class MedicoService {
  constructor() {
    this.medicoRepository = new MedicoRepository();
    this.disponibilidadRepository = new DisponibilidadRepository();
  }

  async getAllMedicos() {
    try {
      const medicos = await this.medicoRepository.findAll();
      return medicos.map(medico => new Medico(medico).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener médicos: ${error.message}`);
    }
  }

  async getMedicoById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de médico inválido');
      }

      const medico = await this.medicoRepository.findById(id);
      if (!medico) {
        throw new Error(`Médico con ID ${id} no encontrado`);
      }

      return new Medico(medico).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al obtener médico: ${error.message}`);
    }
  }

  async getMedicoByMatricula(matricula) {
    try {
      if (!matricula || !/^\d{6}$/.test(matricula)) {
        throw new Error('Matrícula inválida');
      }

      const medico = await this.medicoRepository.findByMatricula(matricula);
      if (!medico) {
        throw new Error(`Médico con matrícula ${matricula} no encontrado`);
      }

      return new Medico(medico).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al obtener médico por matrícula: ${error.message}`);
    }
  }

  async getMedicosByEspecialidad(especialidad) {
    try {
      if (!especialidad || especialidad.trim().length < 3) {
        throw new Error('La especialidad debe tener al menos 3 caracteres');
      }

      const medicos = await this.medicoRepository.findByEspecialidad(especialidad.trim());
      return medicos.map(medico => new Medico(medico).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener médicos por especialidad: ${error.message}`);
    }
  }

  async createMedico(medicoData) {
    try {
      // Crear instancia del modelo para validación
      const medico = new Medico(medicoData);
      
      // Validar datos
      const validation = medico.validate();
      if (!validation.isValid) {
        throw new Error(`Datos de médico inválidos: ${validation.error.details[0].message}`);
      }

      // Verificar si ya existe un médico con la misma matrícula
      const existingMedicoByMatricula = await this.medicoRepository.findByMatricula(medicoData.matricula);
      if (existingMedicoByMatricula) {
        throw new Error('Ya existe un médico con esa matrícula');
      }

      // Verificar si ya existe un médico con el mismo email
      const existingMedicoByEmail = await this.medicoRepository.findByMatricula(medicoData.email);
      if (existingMedicoByEmail) {
        throw new Error('Ya existe un médico con ese email');
      }

      // Crear el médico
      const createdMedico = await this.medicoRepository.create(medicoData);
      return new Medico(createdMedico).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al crear médico: ${error.message}`);
    }
  }

  async updateMedico(id, medicoData) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de médico inválido');
      }

      // Verificar que el médico existe
      const existingMedico = await this.medicoRepository.findById(id);
      if (!existingMedico) {
        throw new Error(`Médico con ID ${id} no encontrado`);
      }

      // Validar datos de actualización
      const updateSchema = Medico.getUpdateValidationSchema();
      const { error } = updateSchema.validate(medicoData);
      if (error) {
        throw new Error(`Datos de actualización inválidos: ${error.details[0].message}`);
      }

      // Verificar unicidad de matrícula si se está actualizando
      if (medicoData.matricula && medicoData.matricula !== existingMedico.matricula) {
        const existingMedicoByMatricula = await this.medicoRepository.findByMatricula(medicoData.matricula);
        if (existingMedicoByMatricula) {
          throw new Error('Ya existe un médico con esa matrícula');
        }
      }

      // Verificar unicidad de email si se está actualizando
      if (medicoData.email && medicoData.email !== existingMedico.email) {
        const existingMedicoByEmail = await this.medicoRepository.findByMatricula(medicoData.email);
        if (existingMedicoByEmail) {
          throw new Error('Ya existe un médico con ese email');
        }
      }

      // Actualizar el médico
      const updatedMedico = await this.medicoRepository.update(id, medicoData);
      return new Medico(updatedMedico).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al actualizar médico: ${error.message}`);
    }
  }

  async deleteMedico(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de médico inválido');
      }

      // Verificar que el médico existe
      const existingMedico = await this.medicoRepository.findById(id);
      if (!existingMedico) {
        throw new Error(`Médico con ID ${id} no encontrado`);
      }

      // Eliminar el médico (soft delete)
      const deletedMedico = await this.medicoRepository.delete(id);
      
      // También marcar sus disponibilidades como inactivas
      await this.disponibilidadRepository.deleteByMedicoId(id);
      
      return new Medico(deletedMedico).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al eliminar médico: ${error.message}`);
    }
  }

  async searchMedicos(query) {
    try {
      if (!query || query.trim().length < 2) {
        throw new Error('La búsqueda debe tener al menos 2 caracteres');
      }

      const medicos = await this.medicoRepository.search(query.trim());
      return medicos.map(medico => new Medico(medico).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al buscar médicos: ${error.message}`);
    }
  }

  async getDisponibilidadMedico(medicoId) {
    try {
      if (!medicoId || isNaN(medicoId)) {
        throw new Error('ID de médico inválido');
      }

      // Verificar que el médico existe
      const existingMedico = await this.medicoRepository.findById(medicoId);
      if (!existingMedico) {
        throw new Error(`Médico con ID ${medicoId} no encontrado`);
      }

      const disponibilidades = await this.disponibilidadRepository.findByMedicoId(medicoId);
      return disponibilidades.map(disp => new Disponibilidad(disp).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener disponibilidad del médico: ${error.message}`);
    }
  }

  async checkDisponibilidad(medicoId, diaSemana, hora) {
    try {
      if (!medicoId || isNaN(medicoId)) {
        throw new Error('ID de médico inválido');
      }

      if (diaSemana < 0 || diaSemana > 6) {
        throw new Error('Día de la semana inválido (0-6)');
      }

      if (!hora || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
        throw new Error('Formato de hora inválido (HH:MM)');
      }

      // Verificar que el médico existe
      const existingMedico = await this.medicoRepository.findById(medicoId);
      if (!existingMedico) {
        throw new Error(`Médico con ID ${medicoId} no encontrado`);
      }

      const disponible = await this.disponibilidadRepository.checkDisponibilidad(medicoId, diaSemana, hora);
      return disponible;
    } catch (error) {
      throw new Error(`Error en servicio al verificar disponibilidad: ${error.message}`);
    }
  }

  async getHorariosDisponibles(medicoId, diaSemana) {
    try {
      if (!medicoId || isNaN(medicoId)) {
        throw new Error('ID de médico inválido');
      }

      if (diaSemana < 0 || diaSemana > 6) {
        throw new Error('Día de la semana inválido (0-6)');
      }

      // Verificar que el médico existe
      const existingMedico = await this.medicoRepository.findById(medicoId);
      if (!existingMedico) {
        throw new Error(`Médico con ID ${medicoId} no encontrado`);
      }

      const horarios = await this.disponibilidadRepository.getHorariosDisponibles(medicoId, diaSemana);
      return horarios;
    } catch (error) {
      throw new Error(`Error en servicio al obtener horarios disponibles: ${error.message}`);
    }
  }

  async disconnect() {
    await this.medicoRepository.disconnect();
    await this.disponibilidadRepository.disconnect();
  }
}

module.exports = MedicoService;
