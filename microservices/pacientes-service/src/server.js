const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const pacientesRoutes = require('./routes/pacientes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// Middleware de CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:8000'] 
    : true,
  credentials: true
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error inesperado'
  });
});

// Rutas
app.use('/pacientes', pacientesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Pacientes Service - Sistema de Turnos Médicos',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/pacientes/health',
      pacientes: '/pacientes',
      search: '/pacientes/search?q=query',
      byId: '/pacientes/:id',
      byDNI: '/pacientes/dni/:dni',
      byEmail: '/pacientes/email/:email'
    }
  });
});

// Ruta de health check general
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pacientes Service está funcionando correctamente',
    timestamp: new Date().toISOString(),
    service: 'pacientes-service',
    port: PORT,
    environment: process.env.NODE_ENV
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en este servicio`,
    availableRoutes: [
      '/',
      '/health',
      '/pacientes',
      '/pacientes/health',
      '/pacientes/search',
      '/pacientes/:id',
      '/pacientes/dni/:dni',
      '/pacientes/email/:email'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Pacientes Service iniciado en puerto ${PORT}`);
  console.log(`📊 Health check disponible en: http://localhost:${PORT}/health`);
  console.log(`🔍 API disponible en: http://localhost:${PORT}/pacientes`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;
