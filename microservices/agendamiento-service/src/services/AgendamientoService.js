const TurnoRepository = require('../repositories/TurnoRepository');
const HistorialCambioRepository = require('../repositories/HistorialCambioRepository');
const Turno = require('../models/Turno');
const HistorialCambio = require('../models/HistorialCambio');
const axios = require('axios');
const amqplib = require('amqplib');

class AgendamientoService {
  constructor() {
    this.turnoRepository = new TurnoRepository();
    this.historialCambioRepository = new HistorialCambioRepository();
    this.pacientesServiceUrl = process.env.PACIENTES_SERVICE_URL;
    this.medicosServiceUrl = process.env.MEDICOS_SERVICE_URL;
    this.rabbitUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@rabbitmq:5672';
  }

  async getAllTurnos() {
    try {
      const turnos = await this.turnoRepository.findAll();
      return turnos.map(turno => new Turno(turno).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener turnos: ${error.message}`);
    }
  }

  async getTurnoById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de turno inválido');
      }

      const turno = await this.turnoRepository.findById(id);
      if (!turno) {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }

      return new Turno(turno).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al obtener turno: ${error.message}`);
    }
  }

  async getTurnosByPacienteId(pacienteId) {
    try {
      if (!pacienteId || isNaN(pacienteId)) {
        throw new Error('ID de paciente inválido');
      }

      // Verificar que el paciente existe
      await this.verificarPacienteExiste(pacienteId);

      const turnos = await this.turnoRepository.findByPacienteId(pacienteId);
      return turnos.map(turno => new Turno(turno).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener turnos del paciente: ${error.message}`);
    }
  }

  async getTurnosByMedicoId(medicoId) {
    try {
      if (!medicoId || isNaN(medicoId)) {
        throw new Error('ID de médico inválido');
      }

      // Verificar que el médico existe
      await this.verificarMedicoExiste(medicoId);

      const turnos = await this.turnoRepository.findByMedicoId(medicoId);
      return turnos.map(turno => new Turno(turno).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener turnos del médico: ${error.message}`);
    }
  }

  async getTurnosByEstado(estado) {
    try {
      if (!estado || !['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_SHOW'].includes(estado)) {
        throw new Error('Estado de turno inválido');
      }

      const turnos = await this.turnoRepository.findByEstado(estado);
      return turnos.map(turno => new Turno(turno).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener turnos por estado: ${error.message}`);
    }
  }

  async getTurnosByFecha(fecha) {
    try {
      if (!fecha || isNaN(Date.parse(fecha))) {
        throw new Error('Fecha inválida');
      }

      const turnos = await this.turnoRepository.findByFecha(fecha);
      return turnos.map(turno => new Turno(turno).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener turnos por fecha: ${error.message}`);
    }
  }

  async getTurnosByFechaRango(fechaInicio, fechaFin) {
    try {
      if (!fechaInicio || !fechaFin || isNaN(Date.parse(fechaInicio)) || isNaN(Date.parse(fechaFin))) {
        throw new Error('Fechas inválidas');
      }

      if (new Date(fechaInicio) > new Date(fechaFin)) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      const turnos = await this.turnoRepository.findByFechaRango(fechaInicio, fechaFin);
      return turnos.map(turno => new Turno(turno).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener turnos por rango de fechas: ${error.message}`);
    }
  }

  async crearTurno(turnoData) {
    try {
      // Crear instancia del modelo para validación
      const turno = new Turno(turnoData);
      
      // Validar datos
      const validation = turno.validate();
      if (!validation.isValid) {
        throw new Error(`Datos de turno inválidos: ${validation.error.details[0].message}`);
      }

      // Validar fecha y hora
      const fechaHoraValidation = turno.validateFechaHora();
      if (!fechaHoraValidation.isValid) {
        throw new Error(fechaHoraValidation.error);
      }

      // Verificar que el paciente existe
      await this.verificarPacienteExiste(turnoData.pacienteId);

      // Verificar que el médico existe
      await this.verificarMedicoExiste(turnoData.medicoId);

      // Verificar disponibilidad del médico
      const disponible = await this.turnoRepository.checkDisponibilidad(
        turnoData.medicoId,
        turnoData.fecha,
        turnoData.hora
      );

      if (!disponible) {
        throw new Error('El médico no está disponible en ese horario');
      }

      // Crear el turno
      const createdTurno = await this.turnoRepository.create(turnoData);

      // Crear historial de creación
      const historial = HistorialCambio.createHistorial(
        createdTurno.id,
        'CREACION',
        'Turno creado exitosamente',
        turnoData.usuarioId || null,
        null,
        createdTurno
      );

      await this.historialCambioRepository.create(historial);

      // Publicar evento de turno creado
      await this.publicarEvento('cita.confirmada', {
        tipo: 'TURNO_CREADO',
        turno: createdTurno
      });

      return new Turno(createdTurno).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al crear turno: ${error.message}`);
    }
  }

  async modificarTurno(id, turnoData) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de turno inválido');
      }

      // Verificar que el turno existe
      const existingTurno = await this.turnoRepository.findById(id);
      if (!existingTurno) {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }

      // Verificar que el turno no esté cancelado o completado
      if (existingTurno.estado === 'CANCELADO' || existingTurno.estado === 'COMPLETADO') {
        throw new Error('No se puede modificar un turno cancelado o completado');
      }

      // Validar datos de actualización
      const updateSchema = Turno.getUpdateValidationSchema();
      const { error } = updateSchema.validate(turnoData);
      if (error) {
        throw new Error(`Datos de actualización inválidos: ${error.details[0].message}`);
      }

      // Si se está cambiando la fecha/hora, verificar disponibilidad
      if (turnoData.fecha || turnoData.hora) {
        const fecha = turnoData.fecha || existingTurno.fecha;
        const hora = turnoData.hora || existingTurno.hora;
        const medicoId = turnoData.medicoId || existingTurno.medicoId;

        const disponible = await this.turnoRepository.checkDisponibilidad(medicoId, fecha, hora);
        if (!disponible) {
          throw new Error('El médico no está disponible en el nuevo horario');
        }
      }

      // Si se está cambiando el paciente, verificar que existe
      if (turnoData.pacienteId) {
        await this.verificarPacienteExiste(turnoData.pacienteId);
      }

      // Si se está cambiando el médico, verificar que existe
      if (turnoData.medicoId) {
        await this.verificarMedicoExiste(turnoData.medicoId);
      }

      // Guardar datos anteriores para el historial
      const datosAnteriores = { ...existingTurno };

      // Actualizar el turno
      const updatedTurno = await this.turnoRepository.update(id, turnoData);

      // Crear historial de modificación
      const historial = HistorialCambio.createHistorial(
        id,
        'MODIFICACION',
        'Turno modificado exitosamente',
        turnoData.usuarioId || null,
        datosAnteriores,
        updatedTurno
      );

      await this.historialCambioRepository.create(historial);

      return new Turno(updatedTurno).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al modificar turno: ${error.message}`);
    }
  }

  async cancelarTurno(id, motivo, usuarioId = null) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de turno inválido');
      }

      // Verificar que el turno existe
      const existingTurno = await this.turnoRepository.findById(id);
      if (!existingTurno) {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }

      // Verificar que el turno no esté cancelado o completado
      if (existingTurno.estado === 'CANCELADO') {
        throw new Error('El turno ya está cancelado');
      }

      if (existingTurno.estado === 'COMPLETADO') {
        throw new Error('No se puede cancelar un turno completado');
      }

      // Cancelar el turno
      const canceledTurno = await this.turnoRepository.cancelarTurno(id, motivo);

      // Crear historial de cancelación
      const historial = HistorialCambio.createHistorial(
        id,
        'CANCELACION',
        `Turno cancelado: ${motivo}`,
        usuarioId,
        existingTurno,
        canceledTurno
      );

      await this.historialCambioRepository.create(historial);

      // Publicar evento de turno cancelado
      await this.publicarEvento('cita.cancelada', {
        tipo: 'TURNO_CANCELADO',
        turno: canceledTurno,
        motivo
      });

      return new Turno(canceledTurno).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al cancelar turno: ${error.message}`);
    }
  }

  async confirmarTurno(id, usuarioId = null) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de turno inválido');
      }

      // Verificar que el turno existe
      const existingTurno = await this.turnoRepository.findById(id);
      if (!existingTurno) {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }

      // Verificar que el turno esté pendiente
      if (existingTurno.estado !== 'PENDIENTE') {
        throw new Error('Solo se pueden confirmar turnos pendientes');
      }

      // Confirmar el turno
      const confirmedTurno = await this.turnoRepository.confirmarTurno(id);

      // Crear historial de confirmación
      const historial = HistorialCambio.createHistorial(
        id,
        'CONFIRMACION',
        'Turno confirmado exitosamente',
        usuarioId,
        existingTurno,
        confirmedTurno
      );

      await this.historialCambioRepository.create(historial);

      // Publicar evento de turno confirmado
      await this.publicarEvento('cita.confirmada', {
        tipo: 'TURNO_CONFIRMADO',
        turno: confirmedTurno
      });

      return new Turno(confirmedTurno).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al confirmar turno: ${error.message}`);
    }
  }

  async completarTurno(id, usuarioId = null) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de turno inválido');
      }

      // Verificar que el turno existe
      const existingTurno = await this.turnoRepository.findById(id);
      if (!existingTurno) {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }

      // Verificar que el turno esté confirmado
      if (existingTurno.estado !== 'CONFIRMADO') {
        throw new Error('Solo se pueden completar turnos confirmados');
      }

      // Completar el turno
      const completedTurno = await this.turnoRepository.completarTurno(id);

      // Crear historial de completado
      const historial = HistorialCambio.createHistorial(
        id,
        'MODIFICACION',
        'Turno marcado como completado',
        usuarioId,
        existingTurno,
        completedTurno
      );

      await this.historialCambioRepository.create(historial);

      // Publicar evento de turno completado
      await this.publicarEvento('cita.completada', {
        tipo: 'TURNO_COMPLETADO',
        turno: completedTurno
      });

      return new Turno(completedTurno).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al completar turno: ${error.message}`);
    }
  }

  async marcarNoShow(id, usuarioId = null) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de turno inválido');
      }

      // Verificar que el turno existe
      const existingTurno = await this.turnoRepository.findById(id);
      if (!existingTurno) {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }

      // Verificar que el turno esté confirmado
      if (existingTurno.estado !== 'CONFIRMADO') {
        throw new Error('Solo se pueden marcar como no show turnos confirmados');
      }

      // Marcar como no show
      const noShowTurno = await this.turnoRepository.marcarNoShow(id);

      // Crear historial de no show
      const historial = HistorialCambio.createHistorial(
        id,
        'MODIFICACION',
        'Turno marcado como no show',
        usuarioId,
        existingTurno,
        noShowTurno
      );

      await this.historialCambioRepository.create(historial);

      // Publicar evento de no show
      await this.publicarEvento('cita.no_show', {
        tipo: 'TURNO_NO_SHOW',
        turno: noShowTurno
      });

      return new Turno(noShowTurno).toJSON();
    } catch (error) {
      throw new Error(`Error en servicio al marcar turno como no show: ${error.message}`);
    }
  }

  async publicarEvento(routingKey, payload) {
    try {
      const exchange = 'eventos.citas';
      const conn = await amqplib.connect(this.rabbitUrl);
      const ch = await conn.createChannel();
      await ch.assertExchange(exchange, 'topic', { durable: true });
      ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
        contentType: 'application/json',
        persistent: true
      });
      await ch.close();
      await conn.close();
    } catch (error) {
      console.error('Error publicando evento AMQP:', error.message);
    }
  }

  async searchTurnos(query) {
    try {
      if (!query || query.trim().length < 2) {
        throw new Error('La búsqueda debe tener al menos 2 caracteres');
      }

      const turnos = await this.turnoRepository.search(query.trim());
      return turnos.map(turno => new Turno(turno).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al buscar turnos: ${error.message}`);
    }
  }

  async getHistorialTurno(turnoId) {
    try {
      if (!turnoId || isNaN(turnoId)) {
        throw new Error('ID de turno inválido');
      }

      // Verificar que el turno existe
      const existingTurno = await this.turnoRepository.findById(turnoId);
      if (!existingTurno) {
        throw new Error(`Turno con ID ${turnoId} no encontrado`);
      }

      const historial = await this.historialCambioRepository.findByTurnoId(turnoId);
      return historial.map(h => new HistorialCambio(h).toJSON());
    } catch (error) {
      throw new Error(`Error en servicio al obtener historial del turno: ${error.message}`);
    }
  }

  async getEstadisticas(fechaInicio, fechaFin) {
    try {
      if (!fechaInicio || !fechaFin || isNaN(Date.parse(fechaInicio)) || isNaN(Date.parse(fechaFin))) {
        throw new Error('Fechas inválidas');
      }

      if (new Date(fechaInicio) > new Date(fechaFin)) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      const estadisticas = await this.historialCambioRepository.getEstadisticas(fechaInicio, fechaFin);
      return estadisticas;
    } catch (error) {
      throw new Error(`Error en servicio al obtener estadísticas: ${error.message}`);
    }
  }

  // Métodos auxiliares para verificar existencia de entidades
  async verificarPacienteExiste(pacienteId) {
    try {
      const response = await axios.get(`${this.pacientesServiceUrl}/pacientes/${pacienteId}`);
      if (response.status !== 200) {
        throw new Error('Paciente no encontrado');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('El paciente especificado no existe');
      }
      throw new Error('Error al verificar la existencia del paciente');
    }
  }

  async verificarMedicoExiste(medicoId) {
    try {
      const response = await axios.get(`${this.medicosServiceUrl}/medicos/${medicoId}`);
      if (response.status !== 200) {
        throw new Error('Médico no encontrado');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('El médico especificado no existe');
      }
      throw new Error('Error al verificar la existencia del médico');
    }
  }

  async disconnect() {
    await this.turnoRepository.disconnect();
    await this.historialCambioRepository.disconnect();
  }
}

module.exports = AgendamientoService;
