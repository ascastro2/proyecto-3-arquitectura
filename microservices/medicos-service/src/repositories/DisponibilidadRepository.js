const { PrismaClient } = require('@prisma/client');

class DisponibilidadRepository {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findByMedicoId(medicoId) {
    try {
      const disponibilidades = await this.prisma.disponibilidad.findMany({
        where: { 
          medicoId: parseInt(medicoId),
          activo: true
        },
        orderBy: [
          { diaSemana: 'asc' },
          { horaInicio: 'asc' }
        ]
      });
      return disponibilidades;
    } catch (error) {
      throw new Error(`Error al obtener disponibilidades del médico ${medicoId}: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const disponibilidad = await this.prisma.disponibilidad.findUnique({
        where: { id: parseInt(id) }
      });
      return disponibilidad;
    } catch (error) {
      throw new Error(`Error al obtener disponibilidad con ID ${id}: ${error.message}`);
    }
  }

  async create(disponibilidadData) {
    try {
      const disponibilidad = await this.prisma.disponibilidad.create({
        data: {
          medicoId: parseInt(disponibilidadData.medicoId),
          diaSemana: disponibilidadData.diaSemana,
          horaInicio: disponibilidadData.horaInicio,
          horaFin: disponibilidadData.horaFin,
          activo: disponibilidadData.activo !== undefined ? disponibilidadData.activo : true
        }
      });
      return disponibilidad;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new Error('El médico especificado no existe');
      }
      throw new Error(`Error al crear disponibilidad: ${error.message}`);
    }
  }

  async update(id, disponibilidadData) {
    try {
      const updateData = {};
      
      if (disponibilidadData.medicoId) updateData.medicoId = parseInt(disponibilidadData.medicoId);
      if (disponibilidadData.diaSemana !== undefined) updateData.diaSemana = disponibilidadData.diaSemana;
      if (disponibilidadData.horaInicio) updateData.horaInicio = disponibilidadData.horaInicio;
      if (disponibilidadData.horaFin) updateData.horaFin = disponibilidadData.horaFin;
      if (disponibilidadData.activo !== undefined) updateData.activo = disponibilidadData.activo;

      const disponibilidad = await this.prisma.disponibilidad.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      return disponibilidad;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Disponibilidad con ID ${id} no encontrada`);
      }
      if (error.code === 'P2003') {
        throw new Error('El médico especificado no existe');
      }
      throw new Error(`Error al actualizar disponibilidad: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      // Soft delete: marcar como inactiva
      const disponibilidad = await this.prisma.disponibilidad.update({
        where: { id: parseInt(id) },
        data: { activo: false }
      });
      return disponibilidad;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error(`Disponibilidad con ID ${id} no encontrada`);
      }
      throw new Error(`Error al eliminar disponibilidad: ${error.message}`);
    }
  }

  async checkDisponibilidad(medicoId, diaSemana, hora) {
    try {
      const disponibilidades = await this.prisma.disponibilidad.findMany({
        where: {
          medicoId: parseInt(medicoId),
          diaSemana: parseInt(diaSemana),
          activo: true
        }
      });

      // Verificar si la hora está dentro de algún rango de disponibilidad
      const horaMinutos = this.horaAMinutos(hora);
      
      for (const disp of disponibilidades) {
        const inicioMinutos = this.horaAMinutos(disp.horaInicio);
        const finMinutos = this.horaAMinutos(disp.horaFin);
        
        if (horaMinutos >= inicioMinutos && horaMinutos < finMinutos) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
  }

  async getHorariosDisponibles(medicoId, diaSemana) {
    try {
      const disponibilidades = await this.prisma.disponibilidad.findMany({
        where: {
          medicoId: parseInt(medicoId),
          diaSemana: parseInt(diaSemana),
          activo: true
        },
        orderBy: { horaInicio: 'asc' }
      });

      return disponibilidades.map(disp => ({
        horaInicio: disp.horaInicio,
        horaFin: disp.horaFin
      }));
    } catch (error) {
      throw new Error(`Error al obtener horarios disponibles: ${error.message}`);
    }
  }

  async deleteByMedicoId(medicoId) {
    try {
      // Marcar todas las disponibilidades del médico como inactivas
      await this.prisma.disponibilidad.updateMany({
        where: { medicoId: parseInt(medicoId) },
        data: { activo: false }
      });
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar disponibilidades del médico: ${error.message}`);
    }
  }

  horaAMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = DisponibilidadRepository;
