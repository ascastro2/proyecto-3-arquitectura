const { PrismaClient } = require('@prisma/client');

class NotificacionRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll() {
    try {
      return await this.prisma.notificacion.findMany({
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await this.prisma.notificacion.findUnique({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificación: ${error.message}`);
    }
  }

  async findByTipo(tipo) {
    try {
      return await this.prisma.notificacion.findMany({
        where: { tipo },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones por tipo: ${error.message}`);
    }
  }

  async findByCanal(canal) {
    try {
      return await this.prisma.notificacion.findMany({
        where: { canal },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones por canal: ${error.message}`);
    }
  }

  async findByEstado(estado) {
    try {
      return await this.prisma.notificacion.findMany({
        where: { estado },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones por estado: ${error.message}`);
    }
  }

  async findByPacienteId(pacienteId) {
    try {
      return await this.prisma.notificacion.findMany({
        where: { pacienteId: parseInt(pacienteId) },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones del paciente: ${error.message}`);
    }
  }

  async findByMedicoId(medicoId) {
    try {
      return await this.prisma.notificacion.findMany({
        where: { medicoId: parseInt(medicoId) },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones del médico: ${error.message}`);
    }
  }

  async findByTurnoId(turnoId) {
    try {
      return await this.prisma.notificacion.findMany({
        where: { turnoId: parseInt(turnoId) },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones del turno: ${error.message}`);
    }
  }

  async findByEventoId(eventoId) {
    try {
      return await this.prisma.notificacion.findMany({
        where: { eventoId },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones del evento: ${error.message}`);
    }
  }

  async findPendientes() {
    try {
      return await this.prisma.notificacion.findMany({
        where: { estado: 'PENDIENTE' },
        orderBy: { fechaCreacion: 'asc' }
      });
    } catch (error) {
      throw new Error(`Error al obtener notificaciones pendientes: ${error.message}`);
    }
  }

  async create(notificacionData) {
    try {
      return await this.prisma.notificacion.create({
        data: notificacionData
      });
    } catch (error) {
      throw new Error(`Error al crear notificación: ${error.message}`);
    }
  }

  async update(id, notificacionData) {
    try {
      return await this.prisma.notificacion.update({
        where: { id: parseInt(id) },
        data: notificacionData
      });
    } catch (error) {
      throw new Error(`Error al actualizar notificación: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await this.prisma.notificacion.delete({
        where: { id: parseInt(id) }
      });
    } catch (error) {
      throw new Error(`Error al eliminar notificación: ${error.message}`);
    }
  }

  async updateEstado(id, estado, respuesta = null, error = null) {
    try {
      const updateData = { estado };
      
      if (estado === 'ENVIADO') {
        updateData.fechaEnvio = new Date();
        updateData.respuesta = respuesta;
      } else if (estado === 'FALLIDO') {
        updateData.error = error;
        updateData.intentos = { increment: 1 };
      }

      return await this.prisma.notificacion.update({
        where: { id: parseInt(id) },
        data: updateData
      });
    } catch (error) {
      throw new Error(`Error al actualizar estado de notificación: ${error.message}`);
    }
  }

  async search(query) {
    try {
      return await this.prisma.notificacion.findMany({
        where: {
          OR: [
            { contenido: { contains: query, mode: 'insensitive' } },
            { destinatario: { contains: query, mode: 'insensitive' } },
            { asunto: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { fechaCreacion: 'desc' }
      });
    } catch (error) {
      throw new Error(`Error en búsqueda de notificaciones: ${error.message}`);
    }
  }

  async getEstadisticas(fechaInicio, fechaFin) {
    try {
      const whereClause = {};
      if (fechaInicio && fechaFin) {
        whereClause.fechaCreacion = {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        };
      }

      const [total, enviadas, fallidas, pendientes] = await Promise.all([
        this.prisma.notificacion.count({ where: whereClause }),
        this.prisma.notificacion.count({ where: { ...whereClause, estado: 'ENVIADO' } }),
        this.prisma.notificacion.count({ where: { ...whereClause, estado: 'FALLIDO' } }),
        this.prisma.notificacion.count({ where: { ...whereClause, estado: 'PENDIENTE' } })
      ]);

      return {
        total,
        enviadas,
        fallidas,
        pendientes,
        tasaExito: total > 0 ? ((enviadas / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = NotificacionRepository;
