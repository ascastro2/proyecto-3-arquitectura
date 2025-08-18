const express = require('express');
const MedicoController = require('../controllers/MedicoController');

const router = express.Router();
const medicoController = new MedicoController();

// Health check
router.get('/health', medicoController.healthCheck.bind(medicoController));

// Obtener todos los médicos
router.get('/', medicoController.getAllMedicos.bind(medicoController));

// Buscar médicos
router.get('/search', medicoController.searchMedicos.bind(medicoController));

// Obtener médico por matrícula (más específico)
router.get('/matricula/:matricula', medicoController.getMedicoByMatricula.bind(medicoController));

// Obtener médicos por especialidad (más específico)
router.get('/especialidad/:especialidad', medicoController.getMedicosByEspecialidad.bind(medicoController));

// Obtener médico por ID (menos específico; va al final)
router.get('/:id', medicoController.getMedicoById.bind(medicoController));

// Crear nuevo médico
router.post('/', medicoController.createMedico.bind(medicoController));

// Actualizar médico existente
router.put('/:id', medicoController.updateMedico.bind(medicoController));

// Eliminar médico
router.delete('/:id', medicoController.deleteMedico.bind(medicoController));

// Rutas de disponibilidad
router.get('/:id/disponibilidad', medicoController.getDisponibilidadMedico.bind(medicoController));
router.get('/:id/disponibilidad/check', medicoController.checkDisponibilidad.bind(medicoController));
router.get('/:id/disponibilidad/horarios', medicoController.getHorariosDisponibles.bind(medicoController));

module.exports = router;
