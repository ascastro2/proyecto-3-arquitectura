const { PrismaClient } = require('@prisma/client');

class MedicoRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll() {
    try {
      const medicos = await this.prisma.medico.findMany({
        where: { activo: true },
        orderBy: {
          apellido: 'asc'
        },
        include: {
          disponibilidades: {
            where: { activo: true },
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          }
        }
      });
      return medicos;
    } catch (error) {
      throw new Error(`Error al obtener médicos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const medico = await this.prisma.medico.findUnique({
        where: { id: parseInt(id) },
        include: {
          disponibilidades: {
            where: { activo: true },
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          }
        }
      });
      return medico;
    } catch (error) {
      throw new Error(`Error al obtener médico con ID ${id}: ${error.message}`);
    }
  }

  async findByMatricula(matricula) {
    try {
      const medico = await this.prisma.medico.findUnique({
        where: { matricula },
        include: {
          disponibilidades: {
            where: { activo: true },
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          }
        }
      });
      return medico;
    } catch (error) {
      throw new Error(`Error al obtener médico con matrícula ${matricula}: ${error.message}`);
    }
  }

  async findByEspecialidad(especialidad) {
    try {
      const medicos = await this.prisma.medico.findMany({
        where: { 
          especialidad: { contains: especialidad, mode: 'insensitive' },
          activo: true
        },
        orderBy: {
          apellido: 'asc'
        },
        include: {
          disponibilidades: {
            where: { activo: true },
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          }
        }
      });
      return medicos;
    } catch (error) {
      throw new Error(`Error al obtener médicos por especialidad: ${error.message}`);
    }
  }

  async create(medicoData) {
    try {
      const medico = await this.prisma.medico.create({
        data: {
          matricula: medicoData.matricula,
          nombre: medicoData.nombre,
          apellido: medicoData.apellido,
          especialidad: medicoData.especialidad,
          email: medicoData.email,
          telefono: medicoData.telefono,
          fechaNacimiento: new Date(medicoData.fechaNacimiento),
          direccion: medicoData.direccion,
          activo: medicoData.activo !== undefined ? medicoData.activo : true
        },
        include: {
          disponibilidades: true
        }
      });
      return medico;
    } catch (error) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('matricula')) {
          throw new Error('Ya existe un médico con esa matrícula');
        }
        if (error.meta?.target?.includes('email')) {
          throw new Error('Ya existe un médico con ese email');
        }
      }
      throw new Error(`Error al crear médico: ${error.message}`);
    }
  }

  async update(id, medicoData) {
    try {
      const updateData = {};
      
      if (medicoData.matricula) updateData.matricula = medicoData.matricula;
      if (medicoData.nombre) updateData.nombre = medicoData.nombre;
      if (medicoData.apellido) updateData.apellido = medicoData.apellido;
      if (medicoData.especialidad) updateData.especialidad = medicoData.especialidad;
      if (medicoData.email) updateData.email = medicoData.email;
      if (medicoData.telefono) updateData.telefono = medicoData.telefono;
      if (medicoData.fechaNacimiento) updateData.fechaNacimiento = new Date(medicoData.fechaNacimiento);
      if (medicoData.direccion !== undefined) updateData.direccion = medicoData.direccion;
      if (medicoData.activo !== undefined) updateData.activo = medicoData.activo;

      const medico = await this.prisma.medico.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          disponibilidades: {
            where: { activo: true },
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          }
        }
      });
      return medico;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Médico con ID ${id} no encontrado`);
      }
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('matricula')) {
          throw new Error('Ya existe un médico con esa matrícula');
        }
        if (error.meta?.target?.includes('email')) {
          throw new Error('Ya existe un médico con ese email');
        }
      }
      throw new Error(`Error al actualizar médico: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      // Soft delete: marcar como inactivo
      const medico = await this.prisma.medico.update({
        where: { id: parseInt(id) },
        data: { activo: false }
      });
      return medico;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Médico con ID ${id} no encontrado`);
      }
      throw new Error(`Error al eliminar médico: ${error.message}`);
    }
  }

  async search(query) {
    try {
      const medicos = await this.prisma.medico.findMany({
        where: {
          AND: [
            { activo: true },
            {
              OR: [
                { nombre: { contains: query, mode: 'insensitive' } },
                { apellido: { contains: query, mode: 'insensitive' } },
                { matricula: { contains: query } },
                { especialidad: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        orderBy: {
          apellido: 'asc'
        },
        include: {
          disponibilidades: {
            where: { activo: true },
            orderBy: [
              { diaSemana: 'asc' },
              { horaInicio: 'asc' }
            ]
          }
        }
      });
      return medicos;
    } catch (error) {
      throw new Error(`Error al buscar médicos: ${error.message}`);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = MedicoRepository;
