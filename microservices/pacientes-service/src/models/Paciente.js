const Joi = require('joi');

class Paciente {
  constructor(data) {
    this.id = data.id;
    this.dni = data.dni;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.email = data.email;
    this.telefono = data.telefono;
    this.fechaNacimiento = data.fechaNacimiento;
    this.direccion = data.direccion;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static getValidationSchema() {
    return Joi.object({
      dni: Joi.string().pattern(/^\d{8}$/).required().messages({
        'string.pattern.base': 'El DNI debe tener 8 dígitos numéricos',
        'any.required': 'El DNI es requerido'
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
      })
    });
  }

  static getUpdateValidationSchema() {
    return Joi.object({
      dni: Joi.string().pattern(/^\d{8}$/).optional(),
      nombre: Joi.string().min(2).max(50).optional(),
      apellido: Joi.string().min(2).max(50).optional(),
      email: Joi.string().email().optional(),
      telefono: Joi.string().pattern(/^\d{10}$/).optional(),
      fechaNacimiento: Joi.date().max('now').optional(),
      direccion: Joi.string().max(200).optional()
    });
  }

  validate() {
    const schema = Paciente.getValidationSchema();
    // Solo validar los campos que se envían, no todo el objeto this
    const dataToValidate = {
      dni: this.dni,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento,
      direccion: this.direccion
    };
    const { error } = schema.validate(dataToValidate);
    return { isValid: !error, error };
  }

  toJSON() {
    return {
      id: this.id,
      dni: this.dni,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento,
      direccion: this.direccion,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Paciente;
