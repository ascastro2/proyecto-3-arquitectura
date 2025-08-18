const Joi = require('joi');

class Notificacion {
  constructor(data) {
    this.id = data.id;
    this.tipo = data.tipo;
    this.canal = data.canal;
    this.destinatario = data.destinatario;
    this.asunto = data.asunto;
    this.contenido = data.contenido;
    this.estado = data.estado || 'PENDIENTE';
    this.intentos = data.intentos || 0;
    this.fechaEnvio = data.fechaEnvio;
    this.fechaCreacion = data.fechaCreacion;
    this.fechaActualizacion = data.fechaActualizacion;
    this.pacienteId = data.pacienteId;
    this.medicoId = data.medicoId;
    this.turnoId = data.turnoId;
    this.eventoId = data.eventoId;
    this.respuesta = data.respuesta;
    this.error = data.error;
  }

  static getValidationSchema() {
    return Joi.object({
      tipo: Joi.string().valid('AGENDAMIENTO', 'MODIFICACION', 'CANCELACION', 'RECORDATORIO', 'CONFIRMACION').required()
        .messages({
          'any.only': 'El tipo de notificación debe ser uno de: AGENDAMIENTO, MODIFICACION, CANCELACION, RECORDATORIO, CONFIRMACION'
        }),
      canal: Joi.string().valid('EMAIL', 'SMS').required()
        .messages({
          'any.only': 'El canal debe ser EMAIL o SMS'
        }),
      destinatario: Joi.string().required()
        .messages({
          'string.empty': 'El destinatario es requerido'
        }),
      asunto: Joi.string().when('canal', {
        is: 'EMAIL',
        then: Joi.required(),
        otherwise: Joi.optional()
      }).messages({
        'any.required': 'El asunto es requerido para notificaciones por email'
      }),
      contenido: Joi.string().min(10).max(1000).required()
        .messages({
          'string.min': 'El contenido debe tener al menos 10 caracteres',
          'string.max': 'El contenido no puede exceder 1000 caracteres',
          'string.empty': 'El contenido es requerido'
        }),
      pacienteId: Joi.number().integer().positive().optional(),
      medicoId: Joi.number().integer().positive().optional(),
      turnoId: Joi.number().integer().positive().optional(),
      eventoId: Joi.string().optional()
    });
  }

  static getUpdateValidationSchema() {
    return Joi.object({
      tipo: Joi.string().valid('AGENDAMIENTO', 'MODIFICACION', 'CANCELACION', 'RECORDATORIO', 'CONFIRMACION').optional(),
      canal: Joi.string().valid('EMAIL', 'SMS').optional(),
      destinatario: Joi.string().optional(),
      asunto: Joi.string().optional(),
      contenido: Joi.string().min(10).max(1000).optional(),
      estado: Joi.string().valid('PENDIENTE', 'ENVIANDO', 'ENVIADO', 'FALLIDO', 'CANCELADO').optional(),
      intentos: Joi.number().integer().min(0).optional(),
      fechaEnvio: Joi.date().optional(),
      pacienteId: Joi.number().integer().positive().optional(),
      medicoId: Joi.number().integer().positive().optional(),
      turnoId: Joi.number().integer().positive().optional(),
      eventoId: Joi.string().optional(),
      respuesta: Joi.string().optional(),
      error: Joi.string().optional()
    });
  }

  validate() {
    const schema = Notificacion.getValidationSchema();
    const { error, value } = schema.validate(this);
    
    return {
      isValid: !error,
      error: error,
      value: value
    };
  }

  toJSON() {
    return {
      id: this.id,
      tipo: this.tipo,
      canal: this.canal,
      destinatario: this.destinatario,
      asunto: this.asunto,
      contenido: this.contenido,
      estado: this.estado,
      intentos: this.intentos,
      fechaEnvio: this.fechaEnvio,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
      pacienteId: this.pacienteId,
      medicoId: this.medicoId,
      turnoId: this.turnoId,
      eventoId: this.eventoId,
      respuesta: this.respuesta,
      error: this.error
    };
  }

  static getTipoLabel(tipo) {
    const labels = {
      'AGENDAMIENTO': 'Agendamiento de Cita',
      'MODIFICACION': 'Modificación de Cita',
      'CANCELACION': 'Cancelación de Cita',
      'RECORDATORIO': 'Recordatorio de Cita',
      'CONFIRMACION': 'Confirmación de Cita'
    };
    return labels[tipo] || tipo;
  }

  static getCanalLabel(canal) {
    const labels = {
      'EMAIL': 'Correo Electrónico',
      'SMS': 'Mensaje de Texto'
    };
    return labels[canal] || canal;
  }

  static getEstadoLabel(estado) {
    const labels = {
      'PENDIENTE': 'Pendiente de Envío',
      'ENVIANDO': 'Enviando',
      'ENVIADO': 'Enviado Exitosamente',
      'FALLIDO': 'Falló el Envío',
      'CANCELADO': 'Cancelado'
    };
    return labels[estado] || estado;
  }
}

module.exports = Notificacion;
