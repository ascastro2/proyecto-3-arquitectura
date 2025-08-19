import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { pacientesService } from '../services/pacientesService';
import { Paciente } from '../contexts/AppContext';

interface PacienteFormData {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
}

const initialFormData: PacienteFormData = {
  dni: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fechaNacimiento: '',
  direccion: '',
};

export default function Pacientes() {
  const { state, dispatch } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState<PacienteFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      const pacientes = await pacientesService.getAllPacientes();
      dispatch({ type: 'SET_PACIENTES', payload: pacientes });
    } catch (error) {
      showSnackbar('Error al cargar pacientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      setFormData({
        dni: paciente.dni,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        email: paciente.email,
        telefono: paciente.telefono,
        fechaNacimiento: paciente.fechaNacimiento.split('T')[0],
        direccion: paciente.direccion,
      });
    } else {
      setEditingPaciente(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPaciente(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field: keyof PacienteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validar que todos los campos requeridos estén completos
    const camposRequeridos = Object.values(formData).every(value => value.trim() !== '');
    if (!camposRequeridos) {
      return false;
    }

    // Validar DNI (solo números, 7-8 dígitos)
    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(formData.dni)) {
      showSnackbar('El DNI debe contener solo números (7-8 dígitos)', 'error');
      return false;
    }

    // Validar teléfono (solo números, 10 dígitos, no puede empezar con 0)
    const telefonoRegex = /^[1-9]\d{9}$/;
    if (!telefonoRegex.test(formData.telefono)) {
      showSnackbar('El teléfono debe contener solo números (10 dígitos, no puede empezar con 0)', 'error');
      return false;
    }

    // Validar email (formato válido)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showSnackbar('El email debe tener un formato válido', 'error');
      return false;
    }

    // Validar fecha de nacimiento (fecha válida y edad razonable)
    const fechaNac = new Date(formData.fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    
    if (isNaN(fechaNac.getTime())) {
      showSnackbar('La fecha de nacimiento no es válida', 'error');
      return false;
    }
    
    if (edad < 0 || edad > 120) {
      showSnackbar('La edad debe estar entre 0 y 120 años', 'error');
      return false;
    }

    // Validar dirección (mínimo 10 caracteres)
    if (formData.direccion.trim().length < 10) {
      showSnackbar('La dirección debe tener al menos 10 caracteres', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Todos los campos son obligatorios', 'error');
      return;
    }

    // Log de datos que se van a enviar
    console.log('🚀 PACIENTES - Datos a enviar:', {
      operacion: editingPaciente ? 'ACTUALIZAR' : 'CREAR',
      datos: formData,
      timestamp: new Date().toISOString()
    });

    try {
      setLoading(true);
      if (editingPaciente) {
        console.log('📝 PACIENTES - Actualizando paciente ID:', editingPaciente.id);
        const updatedPaciente = await pacientesService.updatePaciente(editingPaciente.id, formData);
        console.log('✅ PACIENTES - Paciente actualizado exitosamente:', updatedPaciente);
        dispatch({ type: 'UPDATE_PACIENTE', payload: updatedPaciente });
        showSnackbar('Paciente actualizado exitosamente', 'success');
      } else {
        console.log('🆕 PACIENTES - Creando nuevo paciente');
        const newPaciente = await pacientesService.createPaciente(formData);
        console.log('✅ PACIENTES - Paciente creado exitosamente:', newPaciente);
        dispatch({ type: 'ADD_PACIENTE', payload: newPaciente });
        showSnackbar('Paciente creado exitosamente', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('❌ PACIENTES - Error en operación:', error);
      console.error('❌ PACIENTES - Datos que causaron el error:', formData);
      showSnackbar('Error al guardar paciente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este paciente?')) {
      console.log('🗑️ PACIENTES - Eliminando paciente ID:', id);
      try {
        setLoading(true);
        await pacientesService.deletePaciente(id);
        console.log('✅ PACIENTES - Paciente eliminado exitosamente');
        dispatch({ type: 'SET_PACIENTES', payload: state.pacientes.filter(p => p.id !== id) });
        showSnackbar('Paciente eliminado exitosamente', 'success');
      } catch (error) {
        console.error('❌ PACIENTES - Error al eliminar:', error);
        showSnackbar('Error al eliminar paciente', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredPacientes = state.pacientes.filter(paciente =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.dni.includes(searchTerm)
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Pacientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Paciente
        </Button>
      </Box>

      {/* Barra de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Tabla de pacientes */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>DNI</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Fecha Nac.</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredPacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No se encontraron pacientes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacientes.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell>
                        <Chip label={paciente.dni} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{paciente.nombre}</TableCell>
                      <TableCell>{paciente.apellido}</TableCell>
                      <TableCell>{paciente.email}</TableCell>
                      <TableCell>{paciente.telefono}</TableCell>
                      <TableCell>{new Date(paciente.fechaNacimiento).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(paciente)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(paciente.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Diálogo de formulario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="DNI"
                value={formData.dni}
                onChange={(e) => handleInputChange('dni', e.target.value)}
                required
                helperText="Solo números (7-8 dígitos)"
                error={formData.dni !== '' && !/^\d{7,8}$/.test(formData.dni)}
                inputProps={{
                  maxLength: 8,
                  pattern: '[0-9]*'
                }}
              />
            </Box>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
              />
            </Box>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                required
              />
            </Box>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                helperText="Formato: usuario@dominio.com"
                error={formData.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
              />
            </Box>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                required
                helperText="Solo números (10 dígitos, no puede empezar con 0)"
                error={formData.telefono !== '' && !/^[1-9]\d{9}$/.test(formData.telefono)}
                inputProps={{
                  maxLength: 10,
                  pattern: '[0-9]*'
                }}
              />
            </Box>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
            <Box sx={{ flex: '1 1 100%' }}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                multiline
                rows={2}
                required
                helperText={`Mínimo 10 caracteres (${formData.direccion.length}/10)`}
                error={formData.direccion !== '' && formData.direccion.trim().length < 10}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !validateForm()}
          >
            {loading ? <CircularProgress size={20} /> : (editingPaciente ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
