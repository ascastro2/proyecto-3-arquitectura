const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const agendamientoRoutes = require('./routes/agendamiento');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors());

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/agendamiento', agendamientoRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Microservicio de Agendamiento - API de Turnos Médicos',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      turnos: '/turnos',
      disponibilidad: '/disponibilidad',
      historial: '/historial',
      estadisticas: '/estadisticas'
    }
  });
});

// Health check general
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Agendamiento Service está funcionando correctamente',
    timestamp: new Date().toISOString(),
    service: 'agendamiento-service',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Agendamiento Service iniciado en puerto ${PORT}`);
      console.log(`📅 Endpoints disponibles:`);
      console.log(`   - Health: http://localhost:${PORT}/health`);
      console.log(`   - Turnos: http://localhost:${PORT}/turnos`);
      console.log(`   - Disponibilidad: http://localhost:${PORT}/disponibilidad`);
      console.log(`   - Historial: http://localhost:${PORT}/historial`);
      console.log(`   - Estadísticas: http://localhost:${PORT}/estadisticas`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
