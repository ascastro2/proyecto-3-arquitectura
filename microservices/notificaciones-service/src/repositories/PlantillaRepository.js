const { PrismaClient } = require('@prisma/client');

class PlantillaRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll() {
    try {
      return await this.prisma.plantilla.findMany({
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener plantillas: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await this.prisma.plantilla.findUnique({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      throw new Error(`Error al obtener plantilla: ${error.message}`);
    }
  }

  async findByNombre(nombre) {
    try {
      return await this.prisma.plantilla.findUnique({
        where: { nombre }
      });
    } catch (error) {
      throw new Error(`Error al obtener plantilla por nombre: ${error.message}`);
    }
  }

  async findByTipo(tipo) {
    try {
      return await this.prisma.plantilla.findMany({
        where: { tipo },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener plantillas por tipo: ${error.message}`);
    }
  }

  async findByCanal(canal) {
    try {
      return await this.prisma.plantilla.findMany({
        where: { canal },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener plantillas por canal: ${error.message}`);
    }
  }

  async findActivas() {
    try {
      return await this.prisma.plantilla.findMany({
        where: { activa: true },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener plantillas activas: ${error.message}`);
    }
  }

  async findByTipoYCanal(tipo, canal) {
    try {
      return await this.prisma.plantilla.findFirst({
        where: { 
          tipo,
          canal,
          activa: true
        }
      });
    } catch (error) {
      throw new Error(`Error al obtener plantilla por tipo y canal: ${error.message}`);
    }
  }

  async create(plantillaData) {
    try {
      return await this.prisma.plantilla.create({
        data: plantillaData
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe una plantilla con ese nombre');
      }
      throw new Error(`Error al crear plantilla: ${error.message}`);
    }
  }

  async update(id, plantillaData) {
    try {
      return await this.prisma.plantilla.update({
        where: { id: parseInt(id) },
        data: plantillaData
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Ya existe una plantilla con ese nombre');
      }
      throw new Error(`Error al actualizar plantilla: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await this.prisma.plantilla.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      throw new Error(`Error al eliminar plantilla: ${error.message}`);
    }
  }

  async activate(id) {
    try {
      return await this.prisma.plantilla.update({
        where: { id: parseInt(id) },
        data: { activa: true }
      });
    } catch (error) {
      throw new Error(`Error al activar plantilla: ${error.message}`);
    }
  }

  async deactivate(id) {
    try {
      return await this.prisma.plantilla.update({
        where: { id: parseInt(id) },
        data: { activa: false }
      });
    } catch (error) {
      throw new Error(`Error al desactivar plantilla: ${error.message}`);
    }
  }

  async search(query) {
    try {
      return await this.prisma.plantilla.findMany({
        where: {
          OR: [
            { nombre: { contains: query, mode: 'insensitive' } },
            { contenido: { contains: query, mode: 'insensitive' } },
            { asunto: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error en búsqueda de plantillas: ${error.message}`);
    }
  }

  async getEstadisticas() {
    try {
      const [total, activas, inactivas] = await Promise.all([
        this.prisma.plantilla.count(),
        this.prisma.plantilla.count({ where: { activa: true } }),
        this.prisma.plantilla.count({ where: { activa: false } })
      ]);

      const porTipo = await this.prisma.plantilla.groupBy({
        by: ['tipo'],
        _count: { tipo: true }
      });

      const porCanal = await this.prisma.plantilla.groupBy({
        by: ['canal'],
        _count: { canal: true }
      });

      return {
        total,
        activas,
        inactivas,
        porTipo,
        porCanal
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = PlantillaRepository;
