const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const notificacionesRoutes = require('./routes/notificaciones');
const amqplib = require('amqplib');
const NotificacionService = require('./services/NotificacionService');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Rutas principales
app.use('/notificaciones', notificacionesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Microservicio de Notificaciones - Sistema de Turnos Médicos',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/notificaciones/health',
      notificaciones: '/notificaciones',
      plantillas: '/notificaciones/plantillas',
      verificarServicios: '/notificaciones/verificar-servicios'
    }
  });
});

// Health check general
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Microservicio de Notificaciones funcionando correctamente',
    timestamp: new Date().toISOString(),
    service: 'notificaciones-service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejador de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en este microservicio`,
    availableEndpoints: {
      base: '/notificaciones',
      health: '/notificaciones/health',
      notificaciones: '/notificaciones',
      plantillas: '/notificaciones/plantillas'
    }
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Microservicio de Notificaciones iniciado en puerto ${PORT}`);
  console.log(`📧 Servicio de Email: ${process.env.SMTP_HOST || 'No configurado'}`);
  console.log(`📱 Servicio de SMS: ${process.env.TWILIO_ACCOUNT_SID ? 'Configurado' : 'No configurado'}`);
  console.log(`🔗 URLs de microservicios:`);
  console.log(`   - Pacientes: ${process.env.PACIENTES_SERVICE_URL || 'No configurado'}`);
  console.log(`   - Médicos: ${process.env.MEDICOS_SERVICE_URL || 'No configurado'}`);
  console.log(`   - Agendamiento: ${process.env.AGENDAMIENTO_SERVICE_URL || 'No configurado'}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Suscripción a eventos AMQP
(async () => {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@rabbitmq:5672';
    const exchange = 'eventos.citas';
    const conn = await amqplib.connect(rabbitUrl);
    const ch = await conn.createChannel();
    await ch.assertExchange(exchange, 'topic', { durable: true });
    const q = await ch.assertQueue('notificaciones.citas', { durable: true });
    await ch.bindQueue(q.queue, exchange, 'cita.*');

    const service = new NotificacionService();
    ch.consume(q.queue, async (msg) => {
      if (!msg) return;
      try {
        const evento = JSON.parse(msg.content.toString());
        // Enviar email/sms básico basado en tipo
        if (evento && evento.turno) {
          const turno = evento.turno;
          // Si hay email del paciente, mandar confirmación simple
          if (turno && turno.paciente_id) {
            // En un escenario real buscaríamos datos del paciente; aquí sólo dejamos registrado
            await service.notificacionRepository.create({
              tipo: evento.tipo || 'EVENTO_CITA',
              destinatario: 'placeholder@local',
              asunto: `Evento ${evento.tipo}`,
              contenido: `Evento ${evento.tipo} para turno ${turno.id}`,
              canal: 'EMAIL',
              estado: 'ENVIADO',
              fechaEnvio: new Date()
            });
          }
        }
        ch.ack(msg);
      } catch (e) {
        console.error('Error procesando mensaje AMQP:', e.message);
        ch.nack(msg, false, false);
      }
    }, { noAck: false });

    console.log('🔔 Suscrito a eventos AMQP en exchange eventos.citas (routing: cita.*)');
  } catch (e) {
    console.error('No se pudo suscribir a AMQP:', e.message);
  }
})();

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;
