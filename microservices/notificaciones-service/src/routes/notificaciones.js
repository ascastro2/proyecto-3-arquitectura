const express = require('express');
const NotificacionController = require('../controllers/NotificacionController');

const router = express.Router();
const notificacionController = new NotificacionController();

// Health check
router.get('/health', notificacionController.healthCheck.bind(notificacionController));

// Verificación de servicios
router.get('/verificar-servicios', notificacionController.verificarServicios.bind(notificacionController));

// Rutas para gestión de notificaciones
router.get('/', notificacionController.getAllNotificaciones.bind(notificacionController));
router.get('/search', notificacionController.searchNotificaciones.bind(notificacionController));
router.get('/pendientes', notificacionController.getNotificacionesPendientes.bind(notificacionController));
router.get('/estadisticas', notificacionController.getEstadisticas.bind(notificacionController));

// Rutas específicas para notificaciones
router.get('/tipo/:tipo', notificacionController.getNotificacionesByTipo.bind(notificacionController));
router.get('/canal/:canal', notificacionController.getNotificacionesByCanal.bind(notificacionController));
router.get('/estado/:estado', notificacionController.getNotificacionesByEstado.bind(notificacionController));
router.get('/paciente/:pacienteId', notificacionController.getNotificacionesByPacienteId.bind(notificacionController));
router.get('/medico/:medicoId', notificacionController.getNotificacionesByMedicoId.bind(notificacionController));
router.get('/turno/:turnoId', notificacionController.getNotificacionesByTurnoId.bind(notificacionController));
router.get('/:id', notificacionController.getNotificacionById.bind(notificacionController));

// Envío de notificaciones
router.post('/enviar', notificacionController.enviarNotificacion.bind(notificacionController));
router.post('/confirmacion-cita', notificacionController.enviarConfirmacionCita.bind(notificacionController));
router.post('/modificacion-cita', notificacionController.enviarModificacionCita.bind(notificacionController));
router.post('/cancelacion-cita', notificacionController.enviarCancelacionCita.bind(notificacionController));
router.post('/recordatorio-cita', notificacionController.enviarRecordatorioCita.bind(notificacionController));

// Rutas para gestión de plantillas
router.get('/plantillas', notificacionController.getAllPlantillas.bind(notificacionController));
router.get('/plantillas/activas', notificacionController.getPlantillasActivas.bind(notificacionController));
router.get('/plantillas/estadisticas', notificacionController.getEstadisticasPlantillas.bind(notificacionController));
router.get('/plantillas/search', notificacionController.searchPlantillas.bind(notificacionController));

// Rutas específicas para plantillas
router.get('/plantillas/tipo/:tipo', notificacionController.getPlantillasByTipo.bind(notificacionController));
router.get('/plantillas/canal/:canal', notificacionController.getPlantillasByCanal.bind(notificacionController));
router.get('/plantillas/nombre/:nombre', notificacionController.getPlantillaByNombre.bind(notificacionController));
router.get('/plantillas/:id', notificacionController.getPlantillaById.bind(notificacionController));

// CRUD de plantillas
router.post('/plantillas', notificacionController.createPlantilla.bind(notificacionController));
router.put('/plantillas/:id', notificacionController.updatePlantilla.bind(notificacionController));
router.delete('/plantillas/:id', notificacionController.deletePlantilla.bind(notificacionController));

// Activación/Desactivación de plantillas
router.patch('/plantillas/:id/activar', notificacionController.activatePlantilla.bind(notificacionController));
router.patch('/plantillas/:id/desactivar', notificacionController.deactivatePlantilla.bind(notificacionController));

module.exports = router;
