const { PrismaClient } = require('@prisma/client');

class TurnoRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll() {
    try {
      const turnos = await this.prisma.turno.findMany({
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turnos;
    } catch (error) {
      throw new Error(`Error al obtener turnos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const turno = await this.prisma.turno.findUnique({
        where: { id: parseInt(id) },
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turno;
    } catch (error) {
      throw new Error(`Error al obtener turno con ID ${id}: ${error.message}`);
    }
  }

  async findByPacienteId(pacienteId) {
    try {
      const turnos = await this.prisma.turno.findMany({
        where: { pacienteId: parseInt(pacienteId) },
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turnos;
    } catch (error) {
      throw new Error(`Error al obtener turnos del paciente ${pacienteId}: ${error.message}`);
    }
  }

  async findByMedicoId(medicoId) {
    try {
      const turnos = await this.prisma.turno.findMany({
        where: { medicoId: parseInt(medicoId) },
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turnos;
    } catch (error) {
      throw new Error(`Error al obtener turnos del médico ${medicoId}: ${error.message}`);
    }
  }

  async findByEstado(estado) {
    try {
      const turnos = await this.prisma.turno.findMany({
        where: { estado },
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turnos;
    } catch (error) {
      throw new Error(`Error al obtener turnos con estado ${estado}: ${error.message}`);
    }
  }

  async findByFecha(fecha) {
    try {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      const turnos = await this.prisma.turno.findMany({
        where: {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turnos;
    } catch (error) {
      throw new Error(`Error al obtener turnos para la fecha ${fecha}: ${error.message}`);
    }
  }

  async findByFechaRango(fechaInicio, fechaFin) {
    try {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);

      const turnos = await this.prisma.turno.findMany({
        where: {
          fecha: {
            gte: inicio,
            lte: fin
          }
        },
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turnos;
    } catch (error) {
      throw new Error(`Error al obtener turnos en el rango de fechas: ${error.message}`);
    }
  }

  async checkDisponibilidad(medicoId, fecha, hora) {
    try {
      const fechaHora = new Date(fecha);
      const [horas, minutos] = hora.split(':').map(Number);
      fechaHora.setHours(horas, minutos, 0, 0);
      
      const fechaInicio = new Date(fechaHora);
      fechaInicio.setMinutes(fechaHora.getMinutes() - 30); // 30 min antes
      
      const fechaFin = new Date(fechaHora);
      fechaFin.setMinutes(fechaHora.getMinutes() + 30); // 30 min después

      const turnosExistentes = await this.prisma.turno.findMany({
        where: {
          medicoId: parseInt(medicoId),
          fecha: {
            gte: fechaInicio,
            lte: fechaFin
          },
          estado: {
            notIn: ['CANCELADO', 'NO_SHOW']
          }
        }
      });

      return turnosExistentes.length === 0;
    } catch (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
  }

  async create(turnoData) {
    try {
      const turno = await this.prisma.turno.create({
        data: {
          pacienteId: parseInt(turnoData.pacienteId),
          medicoId: parseInt(turnoData.medicoId),
          fecha: new Date(turnoData.fecha),
          hora: turnoData.hora,
          diaSemana: turnoData.diaSemana,
          estado: turnoData.estado || 'PENDIENTE',
          motivo: turnoData.motivo,
          observaciones: turnoData.observaciones
        },
        include: {
          historialCambios: true
        }
      });
      return turno;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('El paciente o médico especificado no existe');
      }
      throw new Error(`Error al crear turno: ${error.message}`);
    }
  }

  async update(id, turnoData) {
    try {
      const updateData = {};
      
      if (turnoData.pacienteId) updateData.pacienteId = parseInt(turnoData.pacienteId);
      if (turnoData.medicoId) updateData.medicoId = parseInt(turnoData.medicoId);
      if (turnoData.fecha) updateData.fecha = new Date(turnoData.fecha);
      if (turnoData.hora) updateData.hora = turnoData.hora;
      if (turnoData.diaSemana !== undefined) updateData.diaSemana = turnoData.diaSemana;
      if (turnoData.estado) updateData.estado = turnoData.estado;
      if (turnoData.motivo !== undefined) updateData.motivo = turnoData.motivo;
      if (turnoData.observaciones !== undefined) updateData.observaciones = turnoData.observaciones;

      const turno = await this.prisma.turno.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turno;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }
      if (error.code === 'P2003') {
        throw new Error('El paciente o médico especificado no existe');
      }
      throw new Error(`Error al actualizar turno: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const turno = await this.prisma.turno.delete({
        where: { id: parseInt(id) }
      });
      return turno;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }
      throw new Error(`Error al eliminar turno: ${error.message}`);
    }
  }

  async cancelarTurno(id, motivo) {
    try {
      const turno = await this.prisma.turno.update({
        where: { id: parseInt(id) },
        data: { 
          estado: 'CANCELADO',
          motivo: motivo || 'Turno cancelado'
        },
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turno;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }
      throw new Error(`Error al cancelar turno: ${error.message}`);
    }
  }

  async confirmarTurno(id) {
    try {
      const turno = await this.prisma.turno.update({
        where: { id: parseInt(id) },
        data: { estado: 'CONFIRMADO' },
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turno;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }
      throw new Error(`Error al confirmar turno: ${error.message}`);
    }
  }

  async completarTurno(id) {
    try {
      const turno = await this.prisma.turno.update({
        where: { id: parseInt(id) },
        data: { estado: 'COMPLETADO' },
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turno;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }
      throw new Error(`Error al completar turno: ${error.message}`);
    }
  }

  async marcarNoShow(id) {
    try {
      const turno = await this.prisma.turno.update({
        where: { id: parseInt(id) },
        data: { estado: 'NO_SHOW' },
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turno;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Turno con ID ${id} no encontrado`);
      }
      throw new Error(`Error al marcar turno como no show: ${error.message}`);
    }
  }

  async search(query) {
    try {
      const turnos = await this.prisma.turno.findMany({
        where: {
          OR: [
            { motivo: { contains: query, mode: 'insensitive' } },
            { observaciones: { contains: query, mode: 'insensitive' } }
          ]
        },
        orderBy: [
          { fecha: 'asc' },
          { hora: 'asc' }
        ],
        include: {
          historialCambios: {
            orderBy: { fechaCambio: 'desc' }
          }
        }
      });
      return turnos;
    } catch (error) {
      throw new Error(`Error al buscar turnos: ${error.message}`);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = TurnoRepository;
