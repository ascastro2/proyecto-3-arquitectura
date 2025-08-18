const Joi = require('joi');

class Medico {
  constructor(data) {
    this.id = data.id;
    this.matricula = data.matricula;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.especialidad = data.especialidad;
    this.email = data.email;
    this.telefono = data.telefono;
    this.fechaNacimiento = data.fechaNacimiento;
    this.direccion = data.direccion;
    this.activo = data.activo;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static getValidationSchema() {
    return Joi.object({
      matricula: Joi.string().pattern(/^\d{6}$/).required().messages({
        'string.pattern.base': 'La matrícula debe tener 6 dígitos numéricos',
        'any.required': 'La matrícula es requerida'
      }),
      nombre: Joi.string().min(2).max(50).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 50 caracteres',
        'any.required': 'El nombre es requerido'
      }),
      apellido: Joi.string().min(2).max(50).required().messages({
        'string.min': 'El apellido debe tener al menos 2 caracteres',
        'string.max': 'El apellido no puede exceder 50 caracteres',
        'any.required': 'El apellido es requerido'
      }),
      especialidad: Joi.string().min(3).max(100).required().messages({
        'string.min': 'La especialidad debe tener al menos 3 caracteres',
        'string.max': 'La especialidad no puede exceder 100 caracteres',
        'any.required': 'La especialidad es requerida'
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido'
      }),
      telefono: Joi.string().pattern(/^\d{10}$/).required().messages({
        'string.pattern.base': 'El teléfono debe tener 10 dígitos numéricos',
        'any.required': 'El teléfono es requerido'
      }),
      fechaNacimiento: Joi.date().max('now').required().messages({
        'date.max': 'La fecha de nacimiento no puede ser futura',
        'any.required': 'La fecha de nacimiento es requerida'
      }),
      direccion: Joi.string().max(200).optional().messages({
        'string.max': 'La dirección no puede exceder 200 caracteres'
      }),
      activo: Joi.boolean().default(true)
    });
  }

  static getUpdateValidationSchema() {
    return Joi.object({
      matricula: Joi.string().pattern(/^\d{6}$/).optional(),
      nombre: Joi.string().min(2).max(50).optional(),
      apellido: Joi.string().min(2).max(50).optional(),
      especialidad: Joi.string().min(3).max(100).optional(),
      email: Joi.string().email().optional(),
      telefono: Joi.string().pattern(/^\d{10}$/).optional(),
      fechaNacimiento: Joi.date().max('now').optional(),
      direccion: Joi.string().max(200).optional(),
      activo: Joi.boolean().optional()
    });
  }

  validate() {
    const schema = Medico.getValidationSchema();
    const { error } = schema.validate(this);
    return { isValid: !error, error };
  }

  toJSON() {
    return {
      id: this.id,
      matricula: this.matricula,
      nombre: this.nombre,
      apellido: this.apellido,
      especialidad: this.especialidad,
      email: this.email,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento,
      direccion: this.direccion,
      activo: this.activo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Medico;
