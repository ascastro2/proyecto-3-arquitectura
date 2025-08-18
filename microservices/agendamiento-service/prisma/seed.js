const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Agendamiento Service...');

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.historialCambio.deleteMany();
    await prisma.turno.deleteMany();

    console.log('✅ Datos limpiados correctamente');

    // Crear turnos de ejemplo
    console.log('📅 Creando turnos de ejemplo...');
    
    const turnos = [
      {
        pacienteId: 1, // Debe existir en pacientes-service
        medicoId: 1,   // Debe existir en medicos-service
        fecha: new Date('2024-02-15'),
        hora: '09:00:00',
        duracion: 30,
        estado: 'PENDIENTE',
        motivo: 'Consulta general',
        observaciones: 'Primera consulta del paciente'
      },
      {
        pacienteId: 2,
        medicoId: 1,
        fecha: new Date('2024-02-15'),
        hora: '09:30:00',
        duracion: 30,
        estado: 'CONFIRMADO',
        motivo: 'Control de rutina',
        observaciones: 'Paciente confirmó asistencia'
      },
      {
        pacienteId: 3,
        medicoId: 2,
        fecha: new Date('2024-02-15'),
        hora: '10:00:00',
        duracion: 45,
        estado: 'PENDIENTE',
        motivo: 'Especialidad cardiológica',
        observaciones: 'Consulta por dolor en el pecho'
      },
      {
        pacienteId: 1,
        medicoId: 2,
        fecha: new Date('2024-02-16'),
        hora: '14:00:00',
        duracion: 30,
        estado: 'PENDIENTE',
        motivo: 'Seguimiento',
        observaciones: 'Control post tratamiento'
      },
      {
        pacienteId: 4,
        medicoId: 1,
        fecha: new Date('2024-02-16'),
        hora: '15:00:00',
        duracion: 30,
        estado: 'CANCELADO',
        motivo: 'Consulta general',
        observaciones: 'Cancelado por el paciente'
      }
    ];

    for (const turnoData of turnos) {
      const turno = await prisma.turno.create({
        data: turnoData
      });

      // Crear historial de cambios para cada turno
      await prisma.historialCambio.create({
        data: {
          turnoId: turno.id,
          tipo: 'CREACION',
          descripcion: `Turno creado para ${turnoData.fecha} a las ${turnoData.hora}`,
          datosNuevos: turnoData,
          fechaCambio: new Date()
        }
      });

      // Si el turno está cancelado, agregar historial de cancelación
      if (turnoData.estado === 'CANCELADO') {
        await prisma.historialCambio.create({
          data: {
            turnoId: turno.id,
            tipo: 'CANCELACION',
            descripcion: 'Turno cancelado por el paciente',
            datosAnteriores: { estado: 'PENDIENTE' },
            datosNuevos: { estado: 'CANCELADO' },
            fechaCambio: new Date()
          }
        });
      }

      // Si el turno está confirmado, agregar historial de confirmación
      if (turnoData.estado === 'CONFIRMADO') {
        await prisma.historialCambio.create({
          data: {
            turnoId: turno.id,
            tipo: 'CONFIRMACION',
            descripcion: 'Turno confirmado por el paciente',
            datosAnteriores: { estado: 'PENDIENTE' },
            datosNuevos: { estado: 'CONFIRMADO' },
            fechaCambio: new Date()
          }
        });
      }
    }

    console.log(`✅ ${turnos.length} turnos creados exitosamente`);
    console.log('✅ Seed de Agendamiento Service completado');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
