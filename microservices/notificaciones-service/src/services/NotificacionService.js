const NotificacionRepository = require('../repositories/NotificacionRepository');
const PlantillaRepository = require('../repositories/PlantillaRepository');
const EmailService = require('./EmailService');
const SMSService = require('./SMSService');
const axios = require('axios');

class NotificacionService {
  constructor() {
    this.notificacionRepository = new NotificacionRepository();
    this.plantillaRepository = new PlantillaRepository();
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    
    // URLs de los microservicios para consultar datos
    this.pacientesServiceUrl = process.env.PACIENTES_SERVICE_URL;
    this.medicosServiceUrl = process.env.MEDICOS_SERVICE_URL;
    this.agendamientoServiceUrl = process.env.AGENDAMIENTO_SERVICE_URL;
  }

  // Método principal para enviar notificación
  async enviarNotificacion(notificacionData) {
    try {
      // Validar datos de la notificación
      const notificacion = new (require('../models/Notificacion'))(notificacionData);
      const validation = notificacion.validate();
      if (!validation.isValid) {
        throw new Error(`Datos de notificación inválidos: ${validation.error.details[0].message}`);
      }

      // Crear registro en la base de datos
      const notificacionCreada = await this.notificacionRepository.create(notificacionData);
      
      // Actualizar estado a ENVIANDO
      await this.notificacionRepository.updateEstado(notificacionCreada.id, 'ENVIANDO');

      let resultadoEnvio;
      
      // Enviar según el canal
      if (notificacionData.canal === 'EMAIL') {
        resultadoEnvio = await this.enviarEmail(notificacionCreada);
      } else if (notificacionData.canal === 'SMS') {
        resultadoEnvio = await this.enviarSMS(notificacionCreada);
      } else {
        throw new Error(`Canal de notificación no soportado: ${notificacionData.canal}`);
      }

      // Actualizar estado según el resultado
      if (resultadoEnvio.success) {
        await this.notificacionRepository.updateEstado(
          notificacionCreada.id, 
          'ENVIADO', 
          JSON.stringify(resultadoEnvio)
        );
      } else {
        await this.notificacionRepository.updateEstado(
          notificacionCreada.id, 
          'FALLIDO', 
          null, 
          resultadoEnvio.error
        );
      }

      return {
        success: true,
        notificacion: notificacionCreada,
        resultadoEnvio: resultadoEnvio
      };

    } catch (error) {
      console.error('Error enviando notificación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enviar notificación por email
  async enviarEmail(notificacion) {
    try {
      if (notificacion.canal !== 'EMAIL') {
        throw new Error('La notificación no es de tipo EMAIL');
      }

      return await this.emailService.sendEmail(
        notificacion.destinatario,
        notificacion.asunto,
        notificacion.contenido
      );
    } catch (error) {
      console.error('Error enviando email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enviar notificación por SMS
  async enviarSMS(notificacion) {
    try {
      if (notificacion.canal !== 'SMS') {
        throw new Error('La notificación no es de tipo SMS');
      }

      return await this.smsService.sendSMS(
        notificacion.destinatario,
        notificacion.contenido
      );
    } catch (error) {
      console.error('Error enviando SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enviar notificación usando plantilla
  async enviarNotificacionConPlantilla(tipo, canal, destinatario, variables, metadata = {}) {
    try {
      // Buscar plantilla activa
      const plantilla = await this.plantillaRepository.findByTipoYCanal(tipo, canal);
      if (!plantilla) {
        throw new Error(`No se encontró plantilla activa para tipo ${tipo} y canal ${canal}`);
      }

      // Procesar plantilla con variables
      const contenidoProcesado = plantilla.procesarContenido(variables);
      
      // Crear datos de notificación
      const notificacionData = {
        tipo,
        canal,
        destinatario,
        asunto: contenidoProcesado.asunto,
        contenido: contenidoProcesado.contenido,
        pacienteId: metadata.pacienteId,
        medicoId: metadata.medicoId,
        turnoId: metadata.turnoId,
        eventoId: metadata.eventoId
      };

      return await this.enviarNotificacion(notificacionData);

    } catch (error) {
      console.error('Error enviando notificación con plantilla:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Método para enviar notificación de confirmación de cita
  async enviarConfirmacionCita(pacienteId, turnoId, eventoId) {
    try {
      // Obtener datos del paciente
      const paciente = await this.obtenerDatosPaciente(pacienteId);
      if (!paciente) {
        throw new Error(`No se pudo obtener datos del paciente ${pacienteId}`);
      }

      // Obtener datos del turno y médico
      const turno = await this.obtenerDatosTurno(turnoId);
      if (!turno) {
        throw new Error(`No se pudo obtener datos del turno ${turnoId}`);
      }

      const medico = await this.obtenerDatosMedico(turno.medicoId);
      if (!medico) {
        throw new Error(`No se pudo obtener datos del médico ${turno.medicoId}`);
      }

      // Preparar variables para la plantilla
      const variables = {
        pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
        fecha: new Date(turno.fecha).toLocaleDateString('es-AR'),
        hora: turno.hora,
        medicoNombre: `${medico.nombre} ${medico.apellido}`,
        especialidad: medico.especialidad
      };

      const metadata = {
        pacienteId,
        medicoId: medico.id,
        turnoId,
        eventoId
      };

      // Enviar notificaciones por ambos canales si están disponibles
      const resultados = {};

      // Email
      if (paciente.email) {
        resultados.email = await this.enviarNotificacionConPlantilla(
          'CONFIRMACION',
          'EMAIL',
          paciente.email,
          variables,
          metadata
        );
      }

      // SMS
      if (paciente.telefono) {
        resultados.sms = await this.enviarNotificacionConPlantilla(
          'CONFIRMACION',
          'SMS',
          paciente.telefono,
          variables,
          metadata
        );
      }

      return {
        success: true,
        resultados,
        variables,
        metadata
      };

    } catch (error) {
      console.error('Error enviando confirmación de cita:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Método para enviar notificación de modificación de cita
  async enviarModificacionCita(pacienteId, turnoId, eventoId, datosAnteriores) {
    try {
      // Obtener datos del paciente
      const paciente = await this.obtenerDatosPaciente(pacienteId);
      if (!paciente) {
        throw new Error(`No se pudo obtener datos del paciente ${pacienteId}`);
      }

      // Obtener datos del turno y médico
      const turno = await this.obtenerDatosTurno(turnoId);
      if (!turno) {
        throw new Error(`No se pudo obtener datos del turno ${turnoId}`);
      }

      const medico = await this.obtenerDatosMedico(turno.medicoId);
      if (!medico) {
        throw new Error(`No se pudo obtener datos del médico ${turno.medicoId}`);
      }

      // Preparar variables para la plantilla
      const variables = {
        pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
        fechaAnterior: datosAnteriores.fecha ? new Date(datosAnteriores.fecha).toLocaleDateString('es-AR') : 'N/A',
        horaAnterior: datosAnteriores.hora || 'N/A',
        fechaNueva: new Date(turno.fecha).toLocaleDateString('es-AR'),
        horaNueva: turno.hora,
        medicoNombre: `${medico.nombre} ${medico.apellido}`
      };

      const metadata = {
        pacienteId,
        medicoId: medico.id,
        turnoId,
        eventoId
      };

      // Enviar notificaciones por ambos canales si están disponibles
      const resultados = {};

      // Email
      if (paciente.email) {
        resultados.email = await this.enviarNotificacionConPlantilla(
          'MODIFICACION',
          'EMAIL',
          paciente.email,
          variables,
          metadata
        );
      }

      // SMS
      if (paciente.telefono) {
        resultados.sms = await this.enviarNotificacionConPlantilla(
          'MODIFICACION',
          'SMS',
          paciente.telefono,
          variables,
          metadata
        );
      }

      return {
        success: true,
        resultados,
        variables,
        metadata
      };

    } catch (error) {
      console.error('Error enviando modificación de cita:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Método para enviar notificación de cancelación de cita
  async enviarCancelacionCita(pacienteId, turnoId, eventoId, motivo) {
    try {
      // Obtener datos del paciente
      const paciente = await this.obtenerDatosPaciente(pacienteId);
      if (!paciente) {
        throw new Error(`No se pudo obtener datos del paciente ${pacienteId}`);
      }

      // Obtener datos del turno y médico
      const turno = await this.obtenerDatosTurno(turnoId);
      if (!turno) {
        throw new Error(`No se pudo obtener datos del turno ${turnoId}`);
      }

      const medico = await this.obtenerDatosMedico(turno.medicoId);
      if (!medico) {
        throw new Error(`No se pudo obtener datos del médico ${turno.medicoId}`);
      }

      // Preparar variables para la plantilla
      const variables = {
        pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
        fecha: new Date(turno.fecha).toLocaleDateString('es-AR'),
        hora: turno.hora,
        medicoNombre: `${medico.nombre} ${medico.apellido}`,
        motivo: motivo || 'No especificado'
      };

      const metadata = {
        pacienteId,
        medicoId: medico.id,
        turnoId,
        eventoId
      };

      // Enviar notificaciones por ambos canales si están disponibles
      const resultados = {};

      // Email
      if (paciente.email) {
        resultados.email = await this.enviarNotificacionConPlantilla(
          'CANCELACION',
          'EMAIL',
          paciente.email,
          variables,
          metadata
        );
      }

      // SMS
      if (paciente.telefono) {
        resultados.sms = await this.enviarNotificacionConPlantilla(
          'CANCELACION',
          'SMS',
          paciente.telefono,
          variables,
          metadata
        );
      }

      return {
        success: true,
        resultados,
        variables,
        metadata
      };

    } catch (error) {
      console.error('Error enviando cancelación de cita:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Método para enviar recordatorio de cita
  async enviarRecordatorioCita(pacienteId, turnoId) {
    try {
      // Obtener datos del paciente
      const paciente = await this.obtenerDatosPaciente(pacienteId);
      if (!paciente) {
        throw new Error(`No se pudo obtener datos del paciente ${pacienteId}`);
      }

      // Obtener datos del turno y médico
      const turno = await this.obtenerDatosTurno(turnoId);
      if (!turno) {
        throw new Error(`No se pudo obtener datos del turno ${turnoId}`);
      }

      const medico = await this.obtenerDatosMedico(turno.medicoId);
      if (!medico) {
        throw new Error(`No se pudo obtener datos del médico ${turno.medicoId}`);
      }

      // Preparar variables para la plantilla
      const variables = {
        pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
        fecha: new Date(turno.fecha).toLocaleDateString('es-AR'),
        hora: turno.hora,
        medicoNombre: `${medico.nombre} ${medico.apellido}`,
        especialidad: medico.especialidad
      };

      const metadata = {
        pacienteId,
        medicoId: medico.id,
        turnoId
      };

      // Enviar notificaciones por ambos canales si están disponibles
      const resultados = {};

      // Email
      if (paciente.email) {
        resultados.email = await this.enviarNotificacionConPlantilla(
          'RECORDATORIO',
          'EMAIL',
          paciente.email,
          variables,
          metadata
        );
      }

      // SMS
      if (paciente.telefono) {
        resultados.sms = await this.enviarNotificacionConPlantilla(
          'RECORDATORIO',
          'SMS',
          paciente.telefono,
          variables,
          metadata
        );
      }

      return {
        success: true,
        resultados,
        variables,
        metadata
      };

    } catch (error) {
      console.error('Error enviando recordatorio de cita:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Métodos auxiliares para obtener datos de otros microservicios
  async obtenerDatosPaciente(pacienteId) {
    try {
      const response = await axios.get(`${this.pacientesServiceUrl}/pacientes/${pacienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo datos del paciente ${pacienteId}:`, error.message);
      return null;
    }
  }

  async obtenerDatosMedico(medicoId) {
    try {
      const response = await axios.get(`${this.medicosServiceUrl}/medicos/${medicoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo datos del médico ${medicoId}:`, error.message);
      return null;
    }
  }

  async obtenerDatosTurno(turnoId) {
    try {
      const response = await axios.get(`${this.agendamientoServiceUrl}/turnos/${turnoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo datos del turno ${turnoId}:`, error.message);
      return null;
    }
  }

  // Métodos para gestión de notificaciones
  async getAllNotificaciones() {
    return await this.notificacionRepository.findAll();
  }

  async getNotificacionById(id) {
    return await this.notificacionRepository.findById(id);
  }

  async getNotificacionesByTipo(tipo) {
    return await this.notificacionRepository.findByTipo(tipo);
  }

  async getNotificacionesByCanal(canal) {
    return await this.notificacionRepository.findByCanal(canal);
  }

  async getNotificacionesByEstado(estado) {
    return await this.notificacionRepository.findByEstado(estado);
  }

  async getNotificacionesByPacienteId(pacienteId) {
    return await this.notificacionRepository.findByPacienteId(pacienteId);
  }

  async getNotificacionesByMedicoId(medicoId) {
    return await this.notificacionRepository.findByMedicoId(medicoId);
  }

  async getNotificacionesByTurnoId(turnoId) {
    return await this.notificacionRepository.findByTurnoId(turnoId);
  }

  async getNotificacionesPendientes() {
    return await this.notificacionRepository.findPendientes();
  }

  async searchNotificaciones(query) {
    return await this.notificacionRepository.search(query);
  }

  async getEstadisticas(fechaInicio, fechaFin) {
    return await this.notificacionRepository.getEstadisticas(fechaInicio, fechaFin);
  }

  // Métodos para gestión de plantillas
  async getAllPlantillas() {
    return await this.plantillaRepository.findAll();
  }

  async getPlantillaById(id) {
    return await this.plantillaRepository.findById(id);
  }

  async getPlantillaByNombre(nombre) {
    return await this.plantillaRepository.findByNombre(nombre);
  }

  async getPlantillasByTipo(tipo) {
    return await this.plantillaRepository.findByTipo(tipo);
  }

  async getPlantillasByCanal(canal) {
    return await this.plantillaRepository.findByCanal(canal);
  }

  async getPlantillasActivas() {
    return await this.plantillaRepository.findActivas();
  }

  async createPlantilla(plantillaData) {
    return await this.plantillaRepository.create(plantillaData);
  }

  async updatePlantilla(id, plantillaData) {
    return await this.plantillaRepository.update(id, plantillaData);
  }

  async deletePlantilla(id) {
    return await this.plantillaRepository.delete(id);
  }

  async activatePlantilla(id) {
    return await this.plantillaRepository.activate(id);
  }

  async deactivatePlantilla(id) {
    return await this.plantillaRepository.deactivate(id);
  }

  async searchPlantillas(query) {
    return await this.plantillaRepository.search(query);
  }

  async getEstadisticasPlantillas() {
    return await this.plantillaRepository.getEstadisticas();
  }

  // Métodos para verificación de servicios
  async verificarServicios() {
    const resultados = {};

    // Verificar servicio de email
    try {
      resultados.email = await this.emailService.verifyConnection();
    } catch (error) {
      resultados.email = { success: false, error: error.message };
    }

    // Verificar servicio de SMS
    try {
      resultados.sms = await this.smsService.verifyConnection();
    } catch (error) {
      resultados.sms = { success: false, error: error.message };
    }

    // Verificar conexiones a microservicios
    try {
      const pacienteResponse = await axios.get(`${this.pacientesServiceUrl}/health`);
      resultados.pacientesService = { success: true, status: pacienteResponse.status };
    } catch (error) {
      resultados.pacientesService = { success: false, error: error.message };
    }

    try {
      const medicoResponse = await axios.get(`${this.medicosServiceUrl}/health`);
      resultados.medicosService = { success: true, status: medicoResponse.status };
    } catch (error) {
      resultados.medicosService = { success: false, error: error.message };
    }

    try {
      const agendamientoResponse = await axios.get(`${this.agendamientoServiceUrl}/health`);
      resultados.agendamientoService = { success: true, status: agendamientoResponse.status };
    } catch (error) {
      resultados.agendamientoService = { success: false, error: error.message };
    }

    return resultados;
  }

  async disconnect() {
    await this.notificacionRepository.disconnect();
    await this.plantillaRepository.disconnect();
  }
}

module.exports = NotificacionService;
