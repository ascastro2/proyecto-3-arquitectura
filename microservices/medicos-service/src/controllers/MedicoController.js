const MedicoService = require('../services/MedicoService');

class MedicoController {
  constructor() {
    this.medicoService = new MedicoService();
  }

  // GET /medicos - Obtener todos los médicos
  async getAllMedicos(req, res) {
    try {
      const medicos = await this.medicoService.getAllMedicos();
      res.status(200).json({
        success: true,
        data: medicos,
        message: 'Médicos obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error en getAllMedicos:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /medicos/:id - Obtener médico por ID
  async getMedicoById(req, res) {
    try {
      const { id } = req.params;
      const medico = await this.medicoService.getMedicoById(id);
      
      res.status(200).json({
        success: true,
        data: medico,
        message: 'Médico obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error en getMedicoById:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Médico no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'ID de médico inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /medicos/matricula/:matricula - Obtener médico por matrícula
  async getMedicoByMatricula(req, res) {
    try {
      const { matricula } = req.params;
      const medico = await this.medicoService.getMedicoByMatricula(matricula);
      
      res.status(200).json({
        success: true,
        data: medico,
        message: 'Médico obtenido exitosamente'
      });
    } catch (error) {
      console.error('Error en getMedicoByMatricula:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Médico no encontrado'
        });
      }
      
      if (error.message.includes('inválida')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'Matrícula inválida'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /medicos/especialidad/:especialidad - Obtener médicos por especialidad
  async getMedicosByEspecialidad(req, res) {
    try {
      const { especialidad } = req.params;
      const medicos = await this.medicoService.getMedicosByEspecialidad(especialidad);
      
      res.status(200).json({
        success: true,
        data: medicos,
        message: `Médicos de especialidad '${especialidad}' obtenidos exitosamente`
      });
    } catch (error) {
      console.error('Error en getMedicosByEspecialidad:', error);
      
      if (error.message.includes('al menos 3 caracteres')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'La especialidad debe tener al menos 3 caracteres'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /medicos - Crear nuevo médico
  async createMedico(req, res) {
    try {
      const medicoData = req.body;
      const medico = await this.medicoService.createMedico(medicoData);
      
      res.status(201).json({
        success: true,
        data: medico,
        message: 'Médico creado exitosamente'
      });
    } catch (error) {
      console.error('Error en createMedico:', error);
      
      if (error.message.includes('inválidos')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'Datos de médico inválidos'
        });
      }
      
      if (error.message.includes('Ya existe')) {
        return res.status(409).json({
          success: false,
          error: error.message,
          message: 'Conflicto: El médico ya existe'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // PUT /medicos/:id - Actualizar médico existente
  async updateMedico(req, res) {
    try {
      const { id } = req.params;
      const medicoData = req.body;
      const medico = await this.medicoService.updateMedico(id, medicoData);
      
      res.status(200).json({
        success: true,
        data: medico,
        message: 'Médico actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en updateMedico:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Médico no encontrado'
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
          message: 'Conflicto: La matrícula o email ya existe'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // DELETE /medicos/:id - Eliminar médico
  async deleteMedico(req, res) {
    try {
      const { id } = req.params;
      const medico = await this.medicoService.deleteMedico(id);
      
      res.status(200).json({
        success: true,
        data: medico,
        message: 'Médico eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en deleteMedico:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Médico no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'ID de médico inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /medicos/search?q=query - Buscar médicos
  async searchMedicos(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro de búsqueda requerido',
          message: 'Debe proporcionar un parámetro de búsqueda (q)'
        });
      }
      
      const medicos = await this.medicoService.searchMedicos(q);
      
      res.status(200).json({
        success: true,
        data: medicos,
        message: `Búsqueda completada. Se encontraron ${medicos.length} médicos`
      });
    } catch (error) {
      console.error('Error en searchMedicos:', error);
      
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

  // GET /medicos/:id/disponibilidad - Obtener disponibilidad del médico
  async getDisponibilidadMedico(req, res) {
    try {
      const { id } = req.params;
      const disponibilidades = await this.medicoService.getDisponibilidadMedico(id);
      
      res.status(200).json({
        success: true,
        data: disponibilidades,
        message: 'Disponibilidad del médico obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error en getDisponibilidadMedico:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Médico no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'ID de médico inválido'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /medicos/:id/disponibilidad/check - Verificar disponibilidad en un horario específico
  async checkDisponibilidad(req, res) {
    try {
      const { id } = req.params;
      const { diaSemana, hora } = req.query;
      
      if (!diaSemana || !hora) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros requeridos',
          message: 'Debe proporcionar diaSemana y hora'
        });
      }
      
      const disponible = await this.medicoService.checkDisponibilidad(id, diaSemana, hora);
      
      res.status(200).json({
        success: true,
        data: {
          medicoId: parseInt(id),
          diaSemana: parseInt(diaSemana),
          hora,
          disponible
        },
        message: `Disponibilidad verificada: ${disponible ? 'Disponible' : 'No disponible'}`
      });
    } catch (error) {
      console.error('Error en checkDisponibilidad:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Médico no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'Parámetros inválidos'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /medicos/:id/disponibilidad/horarios - Obtener horarios disponibles para un día
  async getHorariosDisponibles(req, res) {
    try {
      const { id } = req.params;
      const { diaSemana } = req.query;
      
      if (diaSemana === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro requerido',
          message: 'Debe proporcionar diaSemana'
        });
      }
      
      const horarios = await this.medicoService.getHorariosDisponibles(id, diaSemana);
      
      res.status(200).json({
        success: true,
        data: {
          medicoId: parseInt(id),
          diaSemana: parseInt(diaSemana),
          diaLabel: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana],
          horarios
        },
        message: 'Horarios disponibles obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error en getHorariosDisponibles:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          message: 'Médico no encontrado'
        });
      }
      
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          message: 'Parámetros inválidos'
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /medicos/health - Health check
  async healthCheck(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Médicos Service está funcionando correctamente',
        timestamp: new Date().toISOString(),
        service: 'medicos-service'
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

module.exports = MedicoController;
