const { PrismaClient } = require('@prisma/client');

class PacienteRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll() {
    try {
      const pacientes = await this.prisma.paciente.findMany({
        orderBy: {
          apellido: 'asc'
        }
      });
      return pacientes;
    } catch (error) {
      throw new Error(`Error al obtener pacientes: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const paciente = await this.prisma.paciente.findUnique({
        where: { id: parseInt(id) }
      });
      return paciente;
    } catch (error) {
      throw new Error(`Error al obtener paciente con ID ${id}: ${error.message}`);
    }
  }

  async findByDNI(dni) {
    try {
      const paciente = await this.prisma.paciente.findUnique({
        where: { dni }
      });
      return paciente;
    } catch (error) {
      throw new Error(`Error al obtener paciente con DNI ${dni}: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const paciente = await this.prisma.paciente.findUnique({
        where: { email }
      });
      return paciente;
    } catch (error) {
      throw new Error(`Error al obtener paciente con email ${email}: ${error.message}`);
    }
  }

  async create(pacienteData) {
    try {
      const paciente = await this.prisma.paciente.create({
        data: {
          dni: pacienteData.dni,
          nombre: pacienteData.nombre,
          apellido: pacienteData.apellido,
          email: pacienteData.email,
          telefono: pacienteData.telefono,
          fechaNacimiento: new Date(pacienteData.fechaNacimiento),
          direccion: pacienteData.direccion
        }
      });
      return paciente;
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('dni')) {
          throw new Error('Ya existe un paciente con ese DNI');
        }
        if (error.meta?.target?.includes('email')) {
          throw new Error('Ya existe un paciente con ese email');
        }
      }
      throw new Error(`Error al crear paciente: ${error.message}`);
    }
  }

  async update(id, pacienteData) {
    try {
      const updateData = {};
      
      if (pacienteData.dni) updateData.dni = pacienteData.dni;
      if (pacienteData.nombre) updateData.nombre = pacienteData.nombre;
      if (pacienteData.apellido) updateData.apellido = pacienteData.apellido;
      if (pacienteData.email) updateData.email = pacienteData.email;
      if (pacienteData.telefono) updateData.telefono = pacienteData.telefono;
      if (pacienteData.fechaNacimiento) updateData.fechaNacimiento = new Date(pacienteData.fechaNacimiento);
      if (pacienteData.direccion !== undefined) updateData.direccion = pacienteData.direccion;

      const paciente = await this.prisma.paciente.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      return paciente;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Paciente con ID ${id} no encontrado`);
      }
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('dni')) {
          throw new Error('Ya existe un paciente con ese DNI');
        }
        if (error.meta?.target?.includes('email')) {
          throw new Error('Ya existe un paciente con ese email');
        }
      }
      throw new Error(`Error al actualizar paciente: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const paciente = await this.prisma.paciente.delete({
        where: { id: parseInt(id) }
      });
      return paciente;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Paciente con ID ${id} no encontrado`);
      }
      throw new Error(`Error al eliminar paciente: ${error.message}`);
    }
  }

  async search(query) {
    try {
      const pacientes = await this.prisma.paciente.findMany({
        where: {
          OR: [
            { nombre: { contains: query, mode: 'insensitive' } },
            { apellido: { contains: query, mode: 'insensitive' } },
            { dni: { contains: query } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: {
          apellido: 'asc'
        }
      });
      return pacientes;
    } catch (error) {
      throw new Error(`Error al buscar pacientes: ${error.message}`);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = PacienteRepository;
