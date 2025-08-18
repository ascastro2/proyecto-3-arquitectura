const PacienteService = require('../services/PacienteService');

class PacienteController {
  constructor() {
    this.pacienteService = new PacienteService();
  }

  // GET /pacientes - Obtener todos los pacientes
  async getAllPacientes(req, res) {
    try {
      const pacientes = await this.pacienteService.getAllPacientes();
      res.status(200).json({
        success: true,
        data: pacientes,
        message: 'Pacientes obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error en getAllPacientes:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /pacientes/:id - Obtener paciente por ID
  async getPacienteById(req, res) {
    try {
      const { id } = req.params;
      const paciente = await this.pacienteService.getPacienteById(id);
      
      res.status(200).json({
        success: true,
        data: paciente,
        message: 'Paciente obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error en getPacienteById:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Paciente no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'ID de paciente inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /pacientes/dni/:dni - Obtener paciente por DNI
  async getPacienteByDNI(req, res) {
    try {
      const { dni } = req.params;
      const paciente = await this.pacienteService.getPacienteByDNI(dni);
      
      res.status(200).json({
        success: true,
        data: paciente,
        message: 'Paciente obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error en getPacienteByDNI:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Paciente no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'DNI inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /pacientes/email/:email - Obtener paciente por email
  async getPacienteByEmail(req, res) {
    try {
      const { email } = req.params;
      const paciente = await this.pacienteService.getPacienteByEmail(email);
      
      res.status(200).json({
        success: true,
        data: paciente,
        message: 'Paciente obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error en getPacienteByEmail:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Paciente no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'Email inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /pacientes - Crear nuevo paciente
  async createPaciente(req, res) {
    try {
      const pacienteData = req.body;
      const paciente = await this.pacienteService.createPaciente(pacienteData);
      
      res.status(201).json({
        success: true,
        data: paciente,
        message: 'Paciente creado exitosamente'
      });
    } catch (error) {
      console.error('Error en createPaciente:', error);
      
      if (error.message.includes('inválidos')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'Datos de paciente inválidos'
        });
      }
      
      if (error.message.includes('Ya existe')) {
        return res.status(409).json({
          success: false,
          error: error.message,
          message: 'Conflicto: El paciente ya existe'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /pacientes/:id - Actualizar paciente existente
  async updatePaciente(req, res) {
    try {
      const { id } = req.params;
      const pacienteData = req.body;
      const paciente = await this.pacienteService.updatePaciente(id, pacienteData);
      
      res.status(200).json({
        success: true,
        data: paciente,
        message: 'Paciente actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en updatePaciente:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Paciente no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'Datos de actualización inválidos'
        });
      }
      
      if (error.message.includes('Ya existe')) {
        return res.status(409).json({
          success: false,
          error: error.message,
          message: 'Conflicto: El DNI o email ya existe'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /pacientes/:id - Eliminar paciente
  async deletePaciente(req, res) {
    try {
      const { id } = req.params;
      const paciente = await this.pacienteService.deletePaciente(id);
      
      res.status(200).json({
        success: true,
        data: paciente,
        message: 'Paciente eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en deletePaciente:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Paciente no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'ID de paciente inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /pacientes/search?q=query - Buscar pacientes
  async searchPacientes(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro de búsqueda requerido',
          message: 'Debe proporcionar un parámetro de búsqueda (q)'
        });
      }
      
      const pacientes = await this.pacienteService.searchPacientes(q);
      
      res.status(200).json({
        success: true,
        data: pacientes,
        message: `Búsqueda completada. Se encontraron ${pacientes.length} pacientes`
      });
    } catch (error) {
      console.error('Error en searchPacientes:', error);
      
      if (error.message.includes('al menos 2 caracteres')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'La búsqueda debe tener al menos 2 caracteres'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /pacientes/health - Health check
  async healthCheck(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Pacientes Service está funcionando correctamente',
        timestamp: new Date().toISOString(),
        service: 'pacientes-service'
      });
    } catch (error) {
      console.error('Error en healthCheck:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error en health check'
      });
    }
  }
}

module.exports = PacienteController;
