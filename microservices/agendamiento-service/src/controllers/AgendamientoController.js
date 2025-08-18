const AgendamientoService = require('../services/AgendamientoService');

class AgendamientoController {
  constructor() {
    this.agendamientoService = new AgendamientoService();
  }

  // Crear un nuevo turno
  async crearTurno(req, res) {
    try {
      const turnoData = req.body;
      const turno = await this.agendamientoService.crearTurno(turnoData);
      
      res.status(201).json({
        success: true,
        message: 'Turno creado exitosamente',
        data: turno
      });
    } catch (error) {
      console.error('Error al crear turno:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear turno',
        error: error.name
      });
    }
  }

  // Obtener todos los turnos
  async obtenerTurnos(req, res) {
    try {
      const { page = 1, limit = 10, estado, fecha, medicoId, pacienteId } = req.query;
      const turnos = await this.agendamientoService.obtenerTurnos({
        page: parseInt(page),
        limit: parseInt(limit),
        estado,
        fecha,
        medicoId: medicoId ? parseInt(medicoId) : undefined,
        pacienteId: pacienteId ? parseInt(pacienteId) : undefined
      });
      
      res.status(200).json({
        success: true,
        data: turnos
      });
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener turnos',
        error: error.message
      });
    }
  }

  // Obtener un turno por ID
  async obtenerTurnoPorId(req, res) {
    try {
      const { id } = req.params;
      const turno = await this.agendamientoService.obtenerTurnoPorId(parseInt(id));
      
      if (!turno) {
        return res.status(404).json({
          success: false,
          message: 'Turno no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: turno
      });
    } catch (error) {
      console.error('Error al obtener turno:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener turno',
        error: error.message
      });
    }
  }

  // Modificar un turno
  async modificarTurno(req, res) {
    try {
      const { id } = req.params;
      const turnoData = req.body;
      const turno = await this.agendamientoService.modificarTurno(parseInt(id), turnoData);
      
      res.status(200).json({
        success: true,
        message: 'Turno modificado exitosamente',
        data: turno
      });
    } catch (error) {
      console.error('Error al modificar turno:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al modificar turno',
        error: error.name
      });
    }
  }

  // Cancelar un turno
  async cancelarTurno(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const turno = await this.agendamientoService.cancelarTurno(parseInt(id), motivo);
      
      res.status(200).json({
        success: true,
        message: 'Turno cancelado exitosamente',
        data: turno
      });
    } catch (error) {
      console.error('Error al cancelar turno:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cancelar turno',
        error: error.name
      });
    }
  }

  // Confirmar un turno
  async confirmarTurno(req, res) {
    try {
      const { id } = req.params;
      const turno = await this.agendamientoService.confirmarTurno(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: 'Turno confirmado exitosamente',
        data: turno
      });
    } catch (error) {
      console.error('Error al confirmar turno:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al confirmar turno',
        error: error.name
      });
    }
  }

  // Completar un turno
  async completarTurno(req, res) {
    try {
      const { id } = req.params;
      const turno = await this.agendamientoService.completarTurno(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: 'Turno completado exitosamente',
        data: turno
      });
    } catch (error) {
      console.error('Error al completar turno:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al completar turno',
        error: error.name
      });
    }
  }

  // Marcar como no-show
  async marcarNoShow(req, res) {
    try {
      const { id } = req.params;
      const turno = await this.agendamientoService.marcarNoShow(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: 'Turno marcado como no-show exitosamente',
        data: turno
      });
    } catch (error) {
      console.error('Error al marcar no-show:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al marcar no-show',
        error: error.name
      });
    }
  }

  // Buscar disponibilidad
  async buscarDisponibilidad(req, res) {
    try {
      const { medicoId, fecha, horaInicio, horaFin } = req.query;
      const disponibilidad = await this.agendamientoService.buscarDisponibilidad({
        medicoId: parseInt(medicoId),
        fecha,
        horaInicio,
        horaFin
      });
      
      res.status(200).json({
        success: true,
        data: disponibilidad
      });
    } catch (error) {
      console.error('Error al buscar disponibilidad:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al buscar disponibilidad',
        error: error.name
      });
    }
  }

  // Obtener historial de cambios
  async obtenerHistorialCambios(req, res) {
    try {
      const { turnoId, tipo, fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;
      const historial = await this.agendamientoService.obtenerHistorialCambios({
        turnoId: turnoId ? parseInt(turnoId) : undefined,
        tipo,
        fechaInicio,
        fechaFin,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      res.status(200).json({
        success: true,
        data: historial
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de cambios',
        error: error.message
      });
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const estadisticas = await this.agendamientoService.obtenerEstadisticas({
        fechaInicio,
        fechaFin
      });
      
      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  // Health check
  async healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'Agendamiento Service está funcionando correctamente',
      timestamp: new Date().toISOString(),
      service: 'agendamiento-service'
    });
  }
}

module.exports = AgendamientoController;
