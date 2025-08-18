const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const medicosRoutes = require('./routes/medicos');

const app = express();
const PORT = process.env.PORT || 3002;

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

// Rutas del microservicio
app.use('/medicos', medicosRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Microservicio de Médicos - Sistema de Turnos Médicos',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      medicos: '/medicos',
      health: '/medicos/health'
    }
  });
});

// Health check general
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Médicos Service está funcionando correctamente',
    timestamp: new Date().toISOString(),
    service: 'medicos-service',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejador de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en este servicio`,
    availableEndpoints: {
      medicos: '/medicos',
      health: '/health'
    }
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Médicos Service iniciado en puerto ${PORT}`);
  console.log(`📊 Health check disponible en: http://localhost:${PORT}/health`);
  console.log(`🔗 API disponible en: http://localhost:${PORT}/medicos`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado exitosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado exitosamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;
