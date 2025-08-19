const Joi = require('joi');

class Turno {
  constructor(data) {
    this.id = data.id;
    this.pacienteId = data.pacienteId;
    this.medicoId = data.medicoId;
    this.fecha = data.fecha;
    this.hora = data.hora;
    this.diaSemana = data.diaSemana;
    this.estado = data.estado;
    this.motivo = data.motivo;
    this.observaciones = data.observaciones;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static getValidationSchema() {
    return Joi.object({
      pacienteId: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del paciente debe ser un número',
        'number.integer': 'El ID del paciente debe ser un número entero',
        'number.positive': 'El ID del paciente debe ser positivo',
        'any.required': 'El ID del paciente es requerido'
      }),
      medicoId: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del médico debe ser un número',
        'number.integer': 'El ID del médico debe ser un número entero',
        'number.positive': 'El ID del médico debe ser positivo',
        'any.required': 'El ID del médico es requerido'
      }),
      fecha: Joi.date().min('now').required().messages({
        'date.base': 'La fecha debe ser válida',
        'date.min': 'La fecha debe ser futura',
        'any.required': 'La fecha es requerida'
      }),
      hora: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'La hora debe tener formato HH:MM (24h)',
        'any.required': 'La hora es requerida'
      }),
      diaSemana: Joi.number().integer().min(0).max(6).required().messages({
        'number.base': 'El día de la semana debe ser un número',
        'number.integer': 'El día de la semana debe ser un número entero',
        'number.min': 'El día de la semana debe estar entre 0 y 6',
        'number.max': 'El día de la semana debe estar entre 0 y 6',
        'any.required': 'El día de la semana es requerido'
      }),
      estado: Joi.string().valid('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_SHOW').default('PENDIENTE'),
      motivo: Joi.string().max(200).optional().messages({
        'string.max': 'El motivo no puede exceder 200 caracteres'
      }),
      observaciones: Joi.string().max(500).optional().messages({
        'string.max': 'Las observaciones no pueden exceder 500 caracteres'
      })
    });
  }

  static getUpdateValidationSchema() {
    return Joi.object({
      pacienteId: Joi.number().integer().positive().optional(),
      medicoId: Joi.number().integer().positive().optional(),
      fecha: Joi.date().min('now').optional(),
      hora: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      diaSemana: Joi.number().integer().min(0).max(6).optional(),
      estado: Joi.string().valid('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_SHOW').optional(),
      motivo: Joi.string().max(200).optional(),
      observaciones: Joi.string().max(500).optional()
    });
  }

  validate() {
    const schema = Turno.getValidationSchema();
    // Solo validar los campos que se envían, no todo el objeto this
    const dataToValidate = {
      pacienteId: this.pacienteId,
      medicoId: this.medicoId,
      fecha: this.fecha,
      hora: this.hora,
      diaSemana: this.diaSemana,
      estado: this.estado,
      motivo: this.motivo,
      observaciones: this.observaciones
    };
    const { error } = schema.validate(dataToValidate);
    return { isValid: !error, error };
  }

  validateFechaHora() {
    if (this.fecha && this.hora) {
      const fechaHora = new Date(this.fecha);
      const [horas, minutos] = this.hora.split(':').map(Number);
      fechaHora.setHours(horas, minutos, 0, 0);
      
      const ahora = new Date();
      if (fechaHora <= ahora) {
        return { isValid: false, error: 'La fecha y hora del turno deben ser futuras' };
      }

      // Verificar que la fecha coincida con el día de la semana
      const diaSemanaCalculado = fechaHora.getDay();
      if (diaSemanaCalculado !== this.diaSemana) {
        return { isValid: false, error: 'La fecha no coincide con el día de la semana especificado' };
      }
    }
    return { isValid: true };
  }

  toJSON() {
    return {
      id: this.id,
      pacienteId: this.pacienteId,
      medicoId: this.medicoId,
      fecha: this.fecha,
      hora: this.hora,
      diaSemana: this.diaSemana,
      estado: this.estado,
      motivo: this.motivo,
      observaciones: this.observaciones,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static getEstadoLabel(estado) {
    const estados = {
      'PENDIENTE': 'Pendiente',
      'CONFIRMADO': 'Confirmado',
      'CANCELADO': 'Cancelado',
      'COMPLETADO': 'Completado',
      'NO_SHOW': 'No se presentó'
    };
    return estados[estado] || estado;
  }

  static getDiaSemanaLabel(diaSemana) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[diaSemana] || 'Desconocido';
  }
}

module.exports = Turno;
