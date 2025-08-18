const Joi = require('joi');

class Disponibilidad {
  constructor(data) {
    this.id = data.id;
    this.medicoId = data.medicoId;
    this.diaSemana = data.diaSemana;
    this.horaInicio = data.horaInicio;
    this.horaFin = data.horaFin;
    this.activo = data.activo;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static getValidationSchema() {
    return Joi.object({
      medicoId: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del médico debe ser un número',
        'number.integer': 'El ID del médico debe ser un número entero',
        'number.positive': 'El ID del médico debe ser positivo',
        'any.required': 'El ID del médico es requerido'
      }),
      diaSemana: Joi.number().integer().min(0).max(6).required().messages({
        'number.base': 'El día de la semana debe ser un número',
        'number.integer': 'El día de la semana debe ser un número entero',
        'number.min': 'El día de la semana debe estar entre 0 y 6',
        'number.max': 'El día de la semana debe estar entre 0 y 6',
        'any.required': 'El día de la semana es requerido'
      }),
      horaInicio: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'La hora de inicio debe tener formato HH:MM (24h)',
        'any.required': 'La hora de inicio es requerida'
      }),
      horaFin: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'La hora de fin debe tener formato HH:MM (24h)',
        'any.required': 'La hora de fin es requerida'
      }),
      activo: Joi.boolean().default(true)
    });
  }

  static getUpdateValidationSchema() {
    return Joi.object({
      medicoId: Joi.number().integer().positive().optional(),
      diaSemana: Joi.number().integer().min(0).max(6).optional(),
      horaInicio: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      horaFin: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      activo: Joi.boolean().optional()
    });
  }

  validate() {
    const schema = Disponibilidad.getValidationSchema();
    const { error } = schema.validate(this);
    return { isValid: !error, error };
  }

  validateTimeRange() {
    if (this.horaInicio && this.horaFin) {
      const inicio = this.horaInicio.split(':').map(Number);
      const fin = this.horaFin.split(':').map(Number);
      
      const inicioMinutos = inicio[0] * 60 + inicio[1];
      const finMinutos = fin[0] * 60 + fin[1];
      
      if (inicioMinutos >= finMinutos) {
        return { isValid: false, error: 'La hora de inicio debe ser anterior a la hora de fin' };
      }
    }
    return { isValid: true };
  }

  toJSON() {
    return {
      id: this.id,
      medicoId: this.medicoId,
      diaSemana: this.diaSemana,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      activo: this.activo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static getDiaSemanaLabel(diaSemana) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[diaSemana] || 'Desconocido';
  }
}

module.exports = Disponibilidad;
