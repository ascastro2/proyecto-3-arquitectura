const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos de médicos...');

  // Datos de ejemplo para médicos
  const medicos = [
    {
      matricula: '123456',
      nombre: 'Dr. Carlos',
      apellido: 'González',
      especialidad: 'Cardiología',
      email: 'carlos.gonzalez@hospital.com',
      telefono: '1234567890',
      fechaNacimiento: new Date('1975-03-15'),
      direccion: 'Av. San Martín 456, Buenos Aires',
      activo: true
    },
    {
      matricula: '234567',
      nombre: 'Dra. María',
      apellido: 'Rodríguez',
      especialidad: 'Pediatría',
      email: 'maria.rodriguez@hospital.com',
      telefono: '2345678901',
      fechaNacimiento: new Date('1980-07-22'),
      direccion: 'Calle Belgrano 789, Buenos Aires',
      activo: true
    },
    {
      matricula: '345678',
      nombre: 'Dr. Roberto',
      apellido: 'López',
      especialidad: 'Traumatología',
      email: 'roberto.lopez@hospital.com',
      telefono: '3456789012',
      fechaNacimiento: new Date('1972-11-08'),
      direccion: 'Av. Corrientes 321, Buenos Aires',
      activo: true
    },
    {
      matricula: '456789',
      nombre: 'Dra. Ana',
      apellido: 'Martínez',
      especialidad: 'Ginecología',
      email: 'ana.martinez@hospital.com',
      telefono: '4567890123',
      fechaNacimiento: new Date('1978-05-12'),
      direccion: 'Calle Florida 654, Buenos Aires',
      activo: true
    },
    {
      matricula: '567890',
      nombre: 'Dr. Luis',
      apellido: 'Fernández',
      especialidad: 'Neurología',
      email: 'luis.fernandez@hospital.com',
      telefono: '5678901234',
      fechaNacimiento: new Date('1970-09-30'),
      direccion: 'Av. Santa Fe 987, Buenos Aires',
      activo: true
    }
  ];

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.disponibilidad.deleteMany({});
    await prisma.medico.deleteMany({});

    // Crear médicos
    console.log('👨‍⚕️ Creando médicos...');
    for (const medicoData of medicos) {
      const medico = await prisma.medico.create({
        data: medicoData
      });
      console.log(`✅ Médico creado: ${medico.nombre} ${medico.apellido} - ${medico.especialidad}`);

      // Crear disponibilidades para cada médico
      const disponibilidades = [
        // Lunes (1)
        {
          medicoId: medico.id,
          diaSemana: 1,
          horaInicio: '08:00',
          horaFin: '12:00',
          activo: true
        },
        {
          medicoId: medico.id,
          diaSemana: 1,
          horaInicio: '14:00',
          horaFin: '18:00',
          activo: true
        },
        // Martes (2)
        {
          medicoId: medico.id,
          diaSemana: 2,
          horaInicio: '08:00',
          horaFin: '12:00',
          activo: true
        },
        {
          medicoId: medico.id,
          diaSemana: 2,
          horaInicio: '14:00',
          horaFin: '18:00',
          activo: true
        },
        // Miércoles (3)
        {
          medicoId: medico.id,
          diaSemana: 3,
          horaInicio: '08:00',
          horaFin: '12:00',
          activo: true
        },
        // Jueves (4)
        {
          medicoId: medico.id,
          diaSemana: 4,
          horaInicio: '08:00',
          horaFin: '12:00',
          activo: true
        },
        {
          medicoId: medico.id,
          diaSemana: 4,
          horaInicio: '14:00',
          horaFin: '18:00',
          activo: true
        },
        // Viernes (5)
        {
          medicoId: medico.id,
          diaSemana: 5,
          horaInicio: '08:00',
          horaFin: '12:00',
          activo: true
        }
      ];

      for (const dispData of disponibilidades) {
        await prisma.disponibilidad.create({
          data: dispData
        });
      }
      console.log(`📅 Disponibilidades creadas para ${medico.nombre} ${medico.apellido}`);
    }

    console.log('🎉 Seed completado exitosamente!');
    console.log(`📊 Se crearon ${medicos.length} médicos con sus respectivas disponibilidades`);
    
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
  });
