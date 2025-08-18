const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos de notificaciones...');

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.notificacion.deleteMany({});
    await prisma.plantilla.deleteMany({});

    // Crear plantillas de notificaciones
    console.log('📝 Creando plantillas de notificaciones...');
    
    const plantillas = [
      {
        nombre: 'Confirmación de Cita - Email',
        tipo: 'CONFIRMACION',
        canal: 'EMAIL',
        asunto: 'Confirmación de Cita Médica - {{fecha}}',
        contenido: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Confirmación de Cita Médica</h2>
            <p>Estimado/a <strong>{{pacienteNombre}}</strong>,</p>
            <p>Su cita médica ha sido confirmada exitosamente.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">Detalles de la Cita</h3>
              <p><strong>Fecha:</strong> {{fecha}}</p>
              <p><strong>Hora:</strong> {{hora}}</p>
              <p><strong>Médico:</strong> Dr. {{medicoNombre}}</p>
              <p><strong>Especialidad:</strong> {{especialidad}}</p>
            </div>
            
            <p>Por favor, llegue 15 minutos antes de su hora programada.</p>
            <p>Si necesita cancelar o reprogramar su cita, contáctenos con anticipación.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Centro Médico</strong></p>
          </div>
        `,
        variables: ['pacienteNombre', 'fecha', 'hora', 'medicoNombre', 'especialidad'],
        activa: true
      },
      {
        nombre: 'Confirmación de Cita - SMS',
        tipo: 'CONFIRMACION',
        canal: 'SMS',
        asunto: null,
        contenido: 'Hola {{pacienteNombre}}! Su cita médica ha sido confirmada para el {{fecha}} a las {{hora}} con Dr. {{medicoNombre}} ({{especialidad}}). Llegue 15 min antes. Centro Médico.',
        variables: ['pacienteNombre', 'fecha', 'hora', 'medicoNombre', 'especialidad'],
        activa: true
      },
      {
        nombre: 'Modificación de Cita - Email',
        tipo: 'MODIFICACION',
        canal: 'EMAIL',
        asunto: 'Modificación de Cita Médica',
        contenido: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e67e22;">Modificación de Cita Médica</h2>
            <p>Estimado/a <strong>{{pacienteNombre}}</strong>,</p>
            <p>Su cita médica ha sido modificada.</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Cambios Realizados</h3>
              <p><strong>Fecha Anterior:</strong> {{fechaAnterior}} a las {{horaAnterior}}</p>
              <p><strong>Nueva Fecha:</strong> {{fechaNueva}} a las {{horaNueva}}</p>
              <p><strong>Médico:</strong> Dr. {{medicoNombre}}</p>
            </div>
            
            <p>Disculpe las molestias ocasionadas.</p>
            <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Centro Médico</strong></p>
          </div>
        `,
        variables: ['pacienteNombre', 'fechaAnterior', 'horaAnterior', 'fechaNueva', 'horaNueva', 'medicoNombre'],
        activa: true
      },
      {
        nombre: 'Modificación de Cita - SMS',
        tipo: 'MODIFICACION',
        canal: 'SMS',
        asunto: null,
        contenido: 'Hola {{pacienteNombre}}! Su cita médica ha sido modificada para el {{fechaNueva}} a las {{horaNueva}} con Dr. {{medicoNombre}}. Disculpe las molestias. Centro Médico.',
        variables: ['pacienteNombre', 'fechaNueva', 'horaNueva', 'medicoNombre'],
        activa: true
      },
      {
        nombre: 'Cancelación de Cita - Email',
        tipo: 'CANCELACION',
        canal: 'EMAIL',
        asunto: 'Cancelación de Cita Médica',
        contenido: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">Cancelación de Cita Médica</h2>
            <p>Estimado/a <strong>{{pacienteNombre}}</strong>,</p>
            <p>Su cita médica ha sido cancelada.</p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #721c24; margin-top: 0;">Cita Cancelada</h3>
              <p><strong>Fecha:</strong> {{fecha}}</p>
              <p><strong>Hora:</strong> {{hora}}</p>
              <p><strong>Médico:</strong> Dr. {{medicoNombre}}</p>
              <p><strong>Motivo:</strong> {{motivo}}</p>
            </div>
            
            <p>Para reagendar su cita, por favor contáctenos.</p>
            <p>Gracias por su comprensión.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Centro Médico</strong></p>
          </div>
        `,
        variables: ['pacienteNombre', 'fecha', 'hora', 'medicoNombre', 'motivo'],
        activa: true
      },
      {
        nombre: 'Cancelación de Cita - SMS',
        tipo: 'CANCELACION',
        canal: 'SMS',
        asunto: null,
        contenido: 'Hola {{pacienteNombre}}! Su cita médica del {{fecha}} a las {{hora}} con Dr. {{medicoNombre}} ha sido cancelada. Para reagendar contáctenos. Centro Médico.',
        variables: ['pacienteNombre', 'fecha', 'hora', 'medicoNombre'],
        activa: true
      },
      {
        nombre: 'Recordatorio de Cita - Email',
        tipo: 'RECORDATORIO',
        canal: 'EMAIL',
        asunto: 'Recordatorio de Cita Médica - Mañana',
        contenido: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">Recordatorio de Cita Médica</h2>
            <p>Estimado/a <strong>{{pacienteNombre}}</strong>,</p>
            <p>Le recordamos que mañana tiene una cita médica programada.</p>
            
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0c5460; margin-top: 0;">Detalles de la Cita</h3>
              <p><strong>Fecha:</strong> {{fecha}}</p>
              <p><strong>Hora:</strong> {{hora}}</p>
              <p><strong>Médico:</strong> Dr. {{medicoNombre}}</p>
              <p><strong>Especialidad:</strong> {{especialidad}}</p>
            </div>
            
            <p>Por favor, llegue 15 minutos antes de su hora programada.</p>
            <p>Si necesita cancelar o reprogramar su cita, contáctenos inmediatamente.</p>
            
            <p>Saludos cordiales,<br>
            <strong>Centro Médico</strong></p>
          </div>
        `,
        variables: ['pacienteNombre', 'fecha', 'hora', 'medicoNombre', 'especialidad'],
        activa: true
      },
      {
        nombre: 'Recordatorio de Cita - SMS',
        tipo: 'RECORDATORIO',
        canal: 'SMS',
        asunto: null,
        contenido: 'Hola {{pacienteNombre}}! Recordatorio: mañana tiene cita a las {{hora}} con Dr. {{medicoNombre}} ({{especialidad}}). Llegue 15 min antes. Centro Médico.',
        variables: ['pacienteNombre', 'hora', 'medicoNombre', 'especialidad'],
        activa: true
      }
    ];

    for (const plantillaData of plantillas) {
      const plantilla = await prisma.plantilla.create({ data: plantillaData });
      console.log(`✅ Plantilla creada: ${plantilla.nombre} - ${plantilla.tipo} (${plantilla.canal})`);
    }

    console.log('🎉 Seed completado exitosamente!');
    console.log(`📊 Se crearon ${plantillas.length} plantillas de notificaciones`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Error fatal durante el seed:', e);
  process.exit(1);
});
