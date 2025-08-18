const PacienteRepository = require('../repositories/PacienteRepository');
const Paciente = require('../models/Paciente');

class PacienteService {
  constructor() {
    this.pacienteRepository = new PacienteRepository();
  }

  async getAllPacientes() {
    try {
      const pacientes = await this.pacienteRepository.findAll();
      return pacientes.map(paciente => new Paciente(paciente).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener pacientes: ${error.message}`);
    }
  }

  async getPacienteById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de paciente inválido');
      }

      const paciente = await this.pacienteRepository.findById(id);
      if (!paciente) {
        throw new Error(`Paciente con ID ${id} no encontrado`);
      }

      return new Paciente(paciente).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al obtener paciente: ${error.message}`);
    }
  }

  async getPacienteByDNI(dni) {
    try {
      if (!dni || !/^\d{8}$/.test(dni)) {
        throw new Error('DNI inválido');
      }

      const paciente = await this.pacienteRepository.findByDNI(dni);
      if (!paciente) {
        throw new Error(`Paciente con DNI ${dni} no encontrado`);
      }

      return new Paciente(paciente).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al obtener paciente por DNI: ${error.message}`);
    }
  }

  async getPacienteByEmail(email) {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email inválido');
      }

      const paciente = await this.pacienteRepository.findByEmail(email);
      if (!paciente) {
        throw new Error(`Paciente con email ${email} no encontrado`);
      }

      return new Paciente(paciente).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al obtener paciente por email: ${error.message}`);
    }
  }

  async createPaciente(pacienteData) {
    try {
      // Crear instancia del modelo para validación
      const paciente = new Paciente(pacienteData);
      
      // Validar datos
      const validation = paciente.validate();
      if (!validation.isValid) {
        throw new Error(`Datos de paciente inválidos: ${validation.error.details[0].message}`);
      }

      // Verificar si ya existe un paciente con el mismo DNI
      const existingPacienteByDNI = await this.pacienteRepository.findByDNI(pacienteData.dni);
      if (existingPacienteByDNI) {
        throw new Error('Ya existe un paciente con ese DNI');
      }

      // Verificar si ya existe un paciente con el mismo email
      const existingPacienteByEmail = await this.pacienteRepository.findByEmail(pacienteData.email);
      if (existingPacienteByEmail) {
        throw new Error('Ya existe un paciente con ese email');
      }

      // Crear el paciente
      const createdPaciente = await this.pacienteRepository.create(pacienteData);
      return new Paciente(createdPaciente).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al crear paciente: ${error.message}`);
    }
  }

  async updatePaciente(id, pacienteData) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de paciente inválido');
      }

      // Verificar que el paciente existe
      const existingPaciente = await this.pacienteRepository.findById(id);
      if (!existingPaciente) {
        throw new Error(`Paciente con ID ${id} no encontrado`);
      }

      // Validar datos de actualización
      const updateSchema = Paciente.getUpdateValidationSchema();
      const { error } = updateSchema.validate(pacienteData);
      if (error) {
        throw new Error(`Datos de actualización inválidos: ${error.details[0].message}`);
      }

      // Verificar unicidad de DNI si se está actualizando
      if (pacienteData.dni && pacienteData.dni !== existingPaciente.dni) {
        const existingPacienteByDNI = await this.pacienteRepository.findByDNI(pacienteData.dni);
        if (existingPacienteByDNI) {
          throw new Error('Ya existe un paciente con ese DNI');
        }
      }

      // Verificar unicidad de email si se está actualizando
      if (pacienteData.email && pacienteData.email !== existingPaciente.email) {
        const existingPacienteByEmail = await this.pacienteRepository.findByEmail(pacienteData.email);
        if (existingPacienteByEmail) {
          throw new Error('Ya existe un paciente con ese email');
        }
      }

      // Actualizar el paciente
      const updatedPaciente = await this.pacienteRepository.update(id, pacienteData);
      return new Paciente(updatedPaciente).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al actualizar paciente: ${error.message}`);
    }
  }

  async deletePaciente(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de paciente inválido');
      }

      // Verificar que el paciente existe
      const existingPaciente = await this.pacienteRepository.findById(id);
      if (!existingPaciente) {
        throw new Error(`Paciente con ID ${id} no encontrado`);
      }

      // Eliminar el paciente
      const deletedPaciente = await this.pacienteRepository.delete(id);
      return new Paciente(deletedPaciente).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al eliminar paciente: ${error.message}`);
    }
  }

  async searchPacientes(query) {
    try {
      if (!query || query.trim().length < 2) {
        throw new Error('La búsqueda debe tener al menos 2 caracteres');
      }

      const pacientes = await this.pacienteRepository.search(query.trim());
      return pacientes.map(paciente => new Paciente(paciente).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al buscar pacientes: ${error.message}`);
    }
  }

  async disconnect() {
    await this.pacienteRepository.disconnect();
  }
}

module.exports = PacienteService;
