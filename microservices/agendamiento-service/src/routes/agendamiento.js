const express = require('express');
const AgendamientoController = require('../controllers/AgendamientoController');

const router = express.Router();
const agendamientoController = new AgendamientoController();

// Health check
router.get('/health', agendamientoController.healthCheck.bind(agendamientoController));

// Rutas para Turnos
router.post('/turnos', agendamientoController.crearTurno.bind(agendamientoController));
router.get('/turnos', agendamientoController.obtenerTurnos.bind(agendamientoController));
router.get('/turnos/:id', agendamientoController.obtenerTurnoPorId.bind(agendamientoController));
router.put('/turnos/:id', agendamientoController.modificarTurno.bind(agendamientoController));

// Rutas para acciones específicas de turnos
router.patch('/turnos/:id/cancelar', agendamientoController.cancelarTurno.bind(agendamientoController));
router.patch('/turnos/:id/confirmar', agendamientoController.confirmarTurno.bind(agendamientoController));
router.patch('/turnos/:id/completar', agendamientoController.completarTurno.bind(agendamientoController));
router.patch('/turnos/:id/no-show', agendamientoController.marcarNoShow.bind(agendamientoController));

// Rutas para disponibilidad
router.get('/disponibilidad', agendamientoController.buscarDisponibilidad.bind(agendamientoController));

// Rutas para historial y estadísticas
router.get('/historial', agendamientoController.obtenerHistorialCambios.bind(agendamientoController));
router.get('/estadisticas', agendamientoController.obtenerEstadisticas.bind(agendamientoController));

module.exports = router;
