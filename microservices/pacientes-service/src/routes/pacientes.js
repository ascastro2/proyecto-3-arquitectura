const express = require('express');
const PacienteController = require('../controllers/PacienteController');

const router = express.Router();
const pacienteController = new PacienteController();

// Health check
router.get('/health', pacienteController.healthCheck.bind(pacienteController));

// Obtener todos los pacientes
router.get('/', pacienteController.getAllPacientes.bind(pacienteController));

// Buscar pacientes
router.get('/search', pacienteController.searchPacientes.bind(pacienteController));

// Obtener paciente por DNI (más específico)
router.get('/dni/:dni', pacienteController.getPacienteByDNI.bind(pacienteController));

// Obtener paciente por email (más específico)
router.get('/email/:email', pacienteController.getPacienteByEmail.bind(pacienteController));

// Obtener paciente por ID (menos específico; va al final)
router.get('/:id', pacienteController.getPacienteById.bind(pacienteController));

// Crear nuevo paciente
router.post('/', pacienteController.createPaciente.bind(pacienteController));

// Actualizar paciente existente
router.put('/:id', pacienteController.updatePaciente.bind(pacienteController));

// Eliminar paciente
router.delete('/:id', pacienteController.deletePaciente.bind(pacienteController));

module.exports = router;
