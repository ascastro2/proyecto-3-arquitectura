const Joi = require('joi');

class Plantilla {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.tipo = data.tipo;
    this.canal = data.canal;
    this.asunto = data.asunto;
    this.contenido = data.contenido;
    this.variables = data.variables || [];
    this.activa = data.activa !== undefined ? data.activa : true;
    this.fechaCreacion = data.fechaCreacion;
    this.fechaActualizacion = data.fechaActualizacion;
  }

  static getValidationSchema() {
    return Joi.object({
      nombre: Joi.string().min(3).max(100).required()
        .messages({
          'string.min': 'El nombre debe tener al menos 3 caracteres',
          'string.max': 'El nombre no puede exceder 100 caracteres',
          'string.empty': 'El nombre es requerido'
        }),
      tipo: Joi.string().valid('AGENDAMIENTO', 'MODIFICACION', 'CANCELACION', 'RECORDATORIO', 'CONFIRMACION').required()
        .messages({
          'any.only': 'El tipo de notificación debe ser uno de: AGENDAMIENTO, MODIFICACION, CANCELACION, RECORDATORIO, CONFIRMACION'
        }),
      canal: Joi.string().valid('EMAIL', 'SMS').required()
        .messages({
          'any.only': 'El canal debe ser EMAIL o SMS'
        }),
      asunto: Joi.string().when('canal', {
        is: 'EMAIL',
        then: Joi.required(),
        otherwise: Joi.optional()
      }).messages({
        'any.required': 'El asunto es requerido para plantillas de email'
      }),
      contenido: Joi.string().min(10).max(2000).required()
        .messages({
          'string.min': 'El contenido debe tener al menos 10 caracteres',
          'string.max': 'El contenido no puede exceder 2000 caracteres',
          'string.empty': 'El contenido es requerido'
        }),
      variables: Joi.array().items(Joi.string()).default([]),
      activa: Joi.boolean().default(true)
    });
  }

  static getUpdateValidationSchema() {
    return Joi.object({
      nombre: Joi.string().min(3).max(100).optional(),
      tipo: Joi.string().valid('AGENDAMIENTO', 'MODIFICACION', 'CANCELACION', 'RECORDATORIO', 'CONFIRMACION').optional(),
      canal: Joi.string().valid('EMAIL', 'SMS').optional(),
      asunto: Joi.string().optional(),
      contenido: Joi.string().min(10).max(2000).optional(),
      variables: Joi.array().items(Joi.string()).optional(),
      activa: Joi.boolean().optional()
    });
  }

  validate() {
    const schema = Plantilla.getValidationSchema();
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
      nombre: this.nombre,
      tipo: this.tipo,
      canal: this.canal,
      asunto: this.asunto,
      contenido: this.contenido,
      variables: this.variables,
      activa: this.activa,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion
    };
  }

  // Método para reemplazar variables en el contenido
  procesarContenido(datos) {
    let contenidoProcesado = this.contenido;
    let asuntoProcesado = this.asunto;

    // Reemplazar variables en el contenido
    this.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      const valor = datos[variable] || `[${variable}]`;
      
      contenidoProcesado = contenidoProcesado.replace(regex, valor);
      if (asuntoProcesado) {
        asuntoProcesado = asuntoProcesado.replace(regex, valor);
      }
    });

    return {
      contenido: contenidoProcesado,
      asunto: asuntoProcesado
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
}

module.exports = Plantilla;
