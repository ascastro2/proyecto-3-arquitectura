const NotificacionService = require('../services/NotificacionService');

class NotificacionController {
  constructor() {
    this.notificacionService = new NotificacionService();
  }

  // Métodos para gestión de notificaciones
  async getAllNotificaciones(req, res) {
    try {
      const notificaciones = await this.notificacionService.getAllNotificaciones();
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionById(req, res) {
    try {
      const { id } = req.params;
      const notificacion = await this.notificacionService.getNotificacionById(id);
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          error: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        data: notificacion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionesByTipo(req, res) {
    try {
      const { tipo } = req.params;
      const notificaciones = await this.notificacionService.getNotificacionesByTipo(tipo);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length,
        tipo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionesByCanal(req, res) {
    try {
      const { canal } = req.params;
      const notificaciones = await this.notificacionService.getNotificacionesByCanal(canal);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length,
        canal
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionesByEstado(req, res) {
    try {
      const { estado } = req.params;
      const notificaciones = await this.notificacionService.getNotificacionesByEstado(estado);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length,
        estado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionesByPacienteId(req, res) {
    try {
      const { pacienteId } = req.params;
      const notificaciones = await this.notificacionService.getNotificacionesByPacienteId(pacienteId);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length,
        pacienteId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionesByMedicoId(req, res) {
    try {
      const { medicoId } = req.params;
      const notificaciones = await this.notificacionService.getNotificacionesByMedicoId(medicoId);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length,
        medicoId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionesByTurnoId(req, res) {
    try {
      const { turnoId } = req.params;
      const notificaciones = await this.notificacionService.getNotificacionesByTurnoId(turnoId);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length,
        turnoId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getNotificacionesPendientes(req, res) {
    try {
      const notificaciones = await this.notificacionService.getNotificacionesPendientes();
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async searchNotificaciones(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro de búsqueda "q" es requerido'
        });
      }

      const notificaciones = await this.notificacionService.searchNotificaciones(q);
      
      res.json({
        success: true,
        data: notificaciones,
        count: notificaciones.length,
        query: q
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEstadisticas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const estadisticas = await this.notificacionService.getEstadisticas(fechaInicio, fechaFin);
      
      res.json({
        success: true,
        data: estadisticas,
        filtros: { fechaInicio, fechaFin }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Métodos para envío de notificaciones
  async enviarNotificacion(req, res) {
    try {
      const notificacionData = req.body;
      const resultado = await this.notificacionService.enviarNotificacion(notificacionData);
      
      if (resultado.success) {
        res.status(201).json({
          success: true,
          message: 'Notificación enviada exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async enviarConfirmacionCita(req, res) {
    try {
      const { pacienteId, turnoId, eventoId } = req.body;
      
      if (!pacienteId || !turnoId) {
        return res.status(400).json({
          success: false,
          error: 'pacienteId y turnoId son requeridos'
        });
      }

      const resultado = await this.notificacionService.enviarConfirmacionCita(pacienteId, turnoId, eventoId);
      
      if (resultado.success) {
        res.json({
          success: true,
          message: 'Notificación de confirmación enviada exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async enviarModificacionCita(req, res) {
    try {
      const { pacienteId, turnoId, eventoId, datosAnteriores } = req.body;
      
      if (!pacienteId || !turnoId || !datosAnteriores) {
        return res.status(400).json({
          success: false,
          error: 'pacienteId, turnoId y datosAnteriores son requeridos'
        });
      }

      const resultado = await this.notificacionService.enviarModificacionCita(pacienteId, turnoId, eventoId, datosAnteriores);
      
      if (resultado.success) {
        res.json({
          success: true,
          message: 'Notificación de modificación enviada exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async enviarCancelacionCita(req, res) {
    try {
      const { pacienteId, turnoId, eventoId, motivo } = req.body;
      
      if (!pacienteId || !turnoId) {
        return res.status(400).json({
          success: false,
          error: 'pacienteId y turnoId son requeridos'
        });
      }

      const resultado = await this.notificacionService.enviarCancelacionCita(pacienteId, turnoId, eventoId, motivo);
      
      if (resultado.success) {
        res.json({
          success: true,
          message: 'Notificación de cancelación enviada exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async enviarRecordatorioCita(req, res) {
    try {
      const { pacienteId, turnoId } = req.body;
      
      if (!pacienteId || !turnoId) {
        return res.status(400).json({
          success: false,
          error: 'pacienteId y turnoId son requeridos'
        });
      }

      const resultado = await this.notificacionService.enviarRecordatorioCita(pacienteId, turnoId);
      
      if (resultado.success) {
        res.json({
          success: true,
          message: 'Recordatorio de cita enviado exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          error: resultado.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Métodos para gestión de plantillas
  async getAllPlantillas(req, res) {
    try {
      const plantillas = await this.notificacionService.getAllPlantillas();
      res.json({
        success: true,
        data: plantillas,
        count: plantillas.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPlantillaById(req, res) {
    try {
      const { id } = req.params;
      const plantilla = await this.notificacionService.getPlantillaById(id);
      
      if (!plantilla) {
        return res.status(404).json({
          success: false,
          error: 'Plantilla no encontrada'
        });
      }

      res.json({
        success: true,
        data: plantilla
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPlantillaByNombre(req, res) {
    try {
      const { nombre } = req.params;
      const plantilla = await this.notificacionService.getPlantillaByNombre(nombre);
      
      if (!plantilla) {
        return res.status(404).json({
          success: false,
          error: 'Plantilla no encontrada'
        });
      }

      res.json({
        success: true,
        data: plantilla
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPlantillasByTipo(req, res) {
    try {
      const { tipo } = req.params;
      const plantillas = await this.notificacionService.getPlantillasByTipo(tipo);
      
      res.json({
        success: true,
        data: plantillas,
        count: plantillas.length,
        tipo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPlantillasByCanal(req, res) {
    try {
      const { canal } = req.params;
      const plantillas = await this.notificacionService.getPlantillasByCanal(canal);
      
      res.json({
        success: true,
        data: plantillas,
        count: plantillas.length,
        canal
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPlantillasActivas(req, res) {
    try {
      const plantillas = await this.notificacionService.getPlantillasActivas();
      
      res.json({
        success: true,
        data: plantillas,
        count: plantillas.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createPlantilla(req, res) {
    try {
      const plantillaData = req.body;
      const plantilla = await this.notificacionService.createPlantilla(plantillaData);
      
      res.status(201).json({
        success: true,
        message: 'Plantilla creada exitosamente',
        data: plantilla
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updatePlantilla(req, res) {
    try {
      const { id } = req.params;
      const plantillaData = req.body;
      const plantilla = await this.notificacionService.updatePlantilla(id, plantillaData);
      
      res.json({
        success: true,
        message: 'Plantilla actualizada exitosamente',
        data: plantilla
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deletePlantilla(req, res) {
    try {
      const { id } = req.params;
      await this.notificacionService.deletePlantilla(id);
      
      res.json({
        success: true,
        message: 'Plantilla eliminada exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async activatePlantilla(req, res) {
    try {
      const { id } = req.params;
      const plantilla = await this.notificacionService.activatePlantilla(id);
      
      res.json({
        success: true,
        message: 'Plantilla activada exitosamente',
        data: plantilla
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deactivatePlantilla(req, res) {
    try {
      const { id } = req.params;
      const plantilla = await this.notificacionService.deactivatePlantilla(id);
      
      res.json({
        success: true,
        message: 'Plantilla desactivada exitosamente',
        data: plantilla
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async searchPlantillas(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Parámetro de búsqueda "q" es requerido'
        });
      }

      const plantillas = await this.notificacionService.searchPlantillas(q);
      
      res.json({
        success: true,
        data: plantillas,
        count: plantillas.length,
        query: q
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEstadisticasPlantillas(req, res) {
    try {
      const estadisticas = await this.notificacionService.getEstadisticasPlantillas();
      
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Métodos de utilidad
  async verificarServicios(req, res) {
    try {
      const resultados = await this.notificacionService.verificarServicios();
      
      res.json({
        success: true,
        data: resultados
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async healthCheck(req, res) {
    try {
      res.json({
        success: true,
        message: 'Microservicio de Notificaciones funcionando correctamente',
        timestamp: new Date().toISOString(),
        service: 'notificaciones-service',
        version: '1.0.0'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = NotificacionController;
