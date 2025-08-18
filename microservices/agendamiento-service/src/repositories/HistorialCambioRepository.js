const { PrismaClient } = require('@prisma/client');

class HistorialCambioRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findByTurnoId(turnoId) {
    try {
      const historial = await this.prisma.historialCambio.findMany({
        where: { turnoId: parseInt(turnoId) },
        orderBy: { fechaCambio: 'desc' }
      });
      return historial;
    } catch (error) {
      throw new Error(`Error al obtener historial del turno ${turnoId}: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const historial = await this.prisma.historialCambio.findUnique({
        where: { id: parseInt(id) }
      });
      return historial;
    } catch (error) {
      throw new Error(`Error al obtener historial con ID ${id}: ${error.message}`);
    }
  }

  async findByTipoCambio(tipoCambio) {
    try {
      const historial = await this.prisma.historialCambio.findMany({
        where: { tipoCambio },
        orderBy: { fechaCambio: 'desc' },
        include: {
          turno: true
        }
      });
      return historial;
    } catch (error) {
      throw new Error(`Error al obtener historial por tipo de cambio: ${error.message}`);
    }
  }

  async findByFechaRango(fechaInicio, fechaFin) {
    try {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);

      const historial = await this.prisma.historialCambio.findMany({
        where: {
          fechaCambio: {
            gte: inicio,
            lte: fin
          }
        },
        orderBy: { fechaCambio: 'desc' },
        include: {
          turno: true
        }
      });
      return historial;
    } catch (error) {
      throw new Error(`Error al obtener historial en el rango de fechas: ${error.message}`);
    }
  }

  async create(historialData) {
    try {
      const historial = await this.prisma.historialCambio.create({
        data: {
          turnoId: parseInt(historialData.turnoId),
          tipoCambio: historialData.tipoCambio,
          descripcion: historialData.descripcion,
          fechaCambio: historialData.fechaCambio || new Date(),
          usuarioId: historialData.usuarioId ? parseInt(historialData.usuarioId) : null,
          datosAnteriores: historialData.datosAnteriores || null,
          datosNuevos: historialData.datosNuevos || null
        }
      });
      return historial;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('El turno especificado no existe');
      }
      throw new Error(`Error al crear historial: ${error.message}`);
    }
  }

  async update(id, historialData) {
    try {
      const updateData = {};
      
      if (historialData.turnoId) updateData.turnoId = parseInt(historialData.turnoId);
      if (historialData.tipoCambio) updateData.tipoCambio = historialData.tipoCambio;
      if (historialData.descripcion) updateData.descripcion = historialData.descripcion;
      if (historialData.fechaCambio) updateData.fechaCambio = new Date(historialData.fechaCambio);
      if (historialData.usuarioId !== undefined) updateData.usuarioId = historialData.usuarioId ? parseInt(historialData.usuarioId) : null;
      if (historialData.datosAnteriores !== undefined) updateData.datosAnteriores = historialData.datosAnteriores;
      if (historialData.datosNuevos !== undefined) updateData.datosNuevos = historialData.datosNuevos;

      const historial = await this.prisma.historialCambio.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      return historial;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Historial con ID ${id} no encontrado`);
      }
      if (error.code === 'P2003') {
        throw new Error('El turno especificado no existe');
      }
      throw new Error(`Error al actualizar historial: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const historial = await this.prisma.historialCambio.delete({
        where: { id: parseInt(id) }
      });
      return historial;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Historial con ID ${id} no encontrado`);
      }
      throw new Error(`Error al eliminar historial: ${error.message}`);
    }
  }

  async deleteByTurnoId(turnoId) {
    try {
      await this.prisma.historialCambio.deleteMany({
        where: { turnoId: parseInt(turnoId) }
      });
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar historial del turno: ${error.message}`);
    }
  }

  async getEstadisticas(fechaInicio, fechaFin) {
    try {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);

      const estadisticas = await this.prisma.historialCambio.groupBy({
        by: ['tipoCambio'],
        where: {
          fechaCambio: {
            gte: inicio,
            lte: fin
          }
        },
        _count: {
          tipoCambio: true
        }
      });

      return estadisticas.map(stat => ({
        tipoCambio: stat.tipoCambio,
        cantidad: stat._count.tipoCambio
      }));
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = HistorialCambioRepository;
