const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos de pacientes...');

  // Datos de pacientes de ejemplo
  const pacientes = [
    {
      dni: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '1234567890',
      fechaNacimiento: new Date('1990-05-15'),
      direccion: 'Av. Libertador 123, Buenos Aires'
    },
    {
      dni: '23456789',
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@email.com',
      telefono: '2345678901',
      fechaNacimiento: new Date('1985-08-22'),
      direccion: 'Calle San Martín 456, Córdoba'
    },
    {
      dni: '34567890',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      telefono: '3456789012',
      fechaNacimiento: new Date('1992-12-10'),
      direccion: 'Rivadavia 789, Rosario'
    },
    {
      dni: '45678901',
      nombre: 'Ana',
      apellido: 'López',
      email: 'ana.lopez@email.com',
      telefono: '4567890123',
      fechaNacimiento: new Date('1988-03-18'),
      direccion: 'Belgrano 321, Mendoza'
    },
    {
      dni: '56789012',
      nombre: 'Luis',
      apellido: 'Martínez',
      email: 'luis.martinez@email.com',
      telefono: '5678901234',
      fechaNacimiento: new Date('1995-07-25'),
      direccion: 'Sarmiento 654, La Plata'
    }
  ];

  try {
    // Limpiar base de datos existente
    console.log('🧹 Limpiando base de datos existente...');
    await prisma.paciente.deleteMany({});

    // Insertar pacientes de ejemplo
    console.log('📝 Insertando pacientes de ejemplo...');
    for (const pacienteData of pacientes) {
      const paciente = await prisma.paciente.create({
        data: pacienteData
      });
      console.log(`✅ Paciente creado: ${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni})`);
    }

    console.log('🎉 Seed completado exitosamente!');
    console.log(`📊 Total de pacientes creados: ${pacientes.length}`);

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
