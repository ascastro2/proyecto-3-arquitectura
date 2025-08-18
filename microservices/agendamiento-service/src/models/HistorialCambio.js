const Joi = require('joi');

class HistorialCambio {
  constructor(data) {
    this.id = data.id;
    this.turnoId = data.turnoId;
    this.tipoCambio = data.tipoCambio;
    this.descripcion = data.descripcion;
    this.fechaCambio = data.fechaCambio;
    this.usuarioId = data.usuarioId;
    this.datosAnteriores = data.datosAnteriores;
    this.datosNuevos = data.datosNuevos;
  }

  static getValidationSchema() {
    return Joi.object({
      turnoId: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del turno debe ser un número',
        'number.integer': 'El ID del turno debe ser un número entero',
        'number.positive': 'El ID del turno debe ser positivo',
        'any.required': 'El ID del turno es requerido'
      }),
      tipoCambio: Joi.string().valid('CREACION', 'MODIFICACION', 'CANCELACION', 'REAGENDAMIENTO', 'CONFIRMACION').required().messages({
        'any.only': 'El tipo de cambio debe ser uno de: CREACION, MODIFICACION, CANCELACION, REAGENDAMIENTO, CONFIRMACION',
        'any.required': 'El tipo de cambio es requerido'
      }),
      descripcion: Joi.string().min(10).max(500).required().messages({
        'string.min': 'La descripción debe tener al menos 10 caracteres',
        'string.max': 'La descripción no puede exceder 500 caracteres',
        'any.required': 'La descripción es requerida'
      }),
      fechaCambio: Joi.date().default('now'),
      usuarioId: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del usuario debe ser un número',
        'number.integer': 'El ID del usuario debe ser un número entero',
        'number.positive': 'El ID del usuario debe ser positivo'
      }),
      datosAnteriores: Joi.object().optional(),
      datosNuevos: Joi.object().optional()
    });
  }

  static getUpdateValidationSchema() {
    return Joi.object({
      turnoId: Joi.number().integer().positive().optional(),
      tipoCambio: Joi.string().valid('CREACION', 'MODIFICACION', 'CANCELACION', 'REAGENDAMIENTO', 'CONFIRMACION').optional(),
      descripcion: Joi.string().min(10).max(500).optional(),
      fechaCambio: Joi.date().optional(),
      usuarioId: Joi.number().integer().positive().optional(),
      datosAnteriores: Joi.object().optional(),
      datosNuevos: Joi.object().optional()
    });
  }

  validate() {
    const schema = HistorialCambio.getValidationSchema();
    const { error } = schema.validate(this);
    return { isValid: !error, error };
  }

  toJSON() {
    return {
      id: this.id,
      turnoId: this.turnoId,
      tipoCambio: this.tipoCambio,
      descripcion: this.descripcion,
      fechaCambio: this.fechaCambio,
      usuarioId: this.usuarioId,
      datosAnteriores: this.datosAnteriores,
      datosNuevos: this.datosNuevos
    };
  }

  static getTipoCambioLabel(tipoCambio) {
    const tipos = {
      'CREACION': 'Creación',
      'MODIFICACION': 'Modificación',
      'CANCELACION': 'Cancelación',
      'REAGENDAMIENTO': 'Reagendamiento',
      'CONFIRMACION': 'Confirmación'
    };
    return tipos[tipoCambio] || tipoCambio;
  }

  static createHistorial(turnoId, tipoCambio, descripcion, usuarioId = null, datosAnteriores = null, datosNuevos = null) {
    return new HistorialCambio({
      turnoId,
      tipoCambio,
      descripcion,
      fechaCambio: new Date(),
      usuarioId,
      datosAnteriores,
      datosNuevos
    });
  }
}

module.exports = HistorialCambio;
