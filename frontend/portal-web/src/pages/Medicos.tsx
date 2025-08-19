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
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { medicosService } from '../services/medicosService';
import { Medico } from '../contexts/AppContext';

interface MedicoFormData {
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  activo: boolean;
}

const initialFormData: MedicoFormData = {
  matricula: '',
  nombre: '',
  apellido: '',
  especialidad: '',
  email: '',
  telefono: '',
  fechaNacimiento: '',
  direccion: '',
  activo: true,
};

const especialidades = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Hematología',
  'Infectología',
  'Medicina Interna',
  'Neurología',
  'Oftalmología',
  'Oncología',
  'Ortopedia',
  'Pediatría',
  'Psiquiatría',
  'Radiología',
  'Traumatología',
  'Urología',
];

export default function Medicos() {
  const { state, dispatch } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);
  const [formData, setFormData] = useState<MedicoFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadMedicos();
  }, []);

  const loadMedicos = async () => {
    try {
      setLoading(true);
      const medicos = await medicosService.getAllMedicos();
      dispatch({ type: 'SET_MEDICOS', payload: medicos });
    } catch (error) {
      showSnackbar('Error al cargar médicos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (medico?: Medico) => {
    if (medico) {
      setEditingMedico(medico);
      setFormData({
        matricula: medico.matricula,
        nombre: medico.nombre,
        apellido: medico.apellido,
        especialidad: medico.especialidad,
        email: medico.email,
        telefono: medico.telefono,
        fechaNacimiento: medico.fechaNacimiento.split('T')[0],
        direccion: medico.direccion,
        activo: medico.activo,
      });
    } else {
      setEditingMedico(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedico(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field: keyof MedicoFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validar que todos los campos requeridos estén completos
    const camposRequeridos = Object.values(formData).every(value => {
      if (typeof value === 'boolean') return true;
      return value.trim() !== '';
    });

    if (!camposRequeridos) {
      return false;
    }

    // Validar matrícula (solo números, 6-10 dígitos)
    const matriculaRegex = /^\d{6,10}$/;
    if (!matriculaRegex.test(formData.matricula)) {
      showSnackbar('La matrícula debe contener solo números (6-10 dígitos)', 'error');
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
    
    if (edad < 22 || edad > 80) {
      showSnackbar('La edad debe estar entre 22 y 80 años', 'error');
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
    console.log('🚀 MÉDICOS - Datos a enviar:', {
      operacion: editingMedico ? 'ACTUALIZAR' : 'CREAR',
      datos: formData,
      timestamp: new Date().toISOString()
    });

    try {
      setLoading(true);
      if (editingMedico) {
        console.log('📝 MÉDICOS - Actualizando médico ID:', editingMedico.id);
        const updatedMedico = await medicosService.updateMedico(editingMedico.id, formData);
        console.log('✅ MÉDICOS - Médico actualizado exitosamente:', updatedMedico);
        dispatch({ type: 'UPDATE_MEDICO', payload: updatedMedico });
        showSnackbar('Médico actualizado exitosamente', 'success');
      } else {
        console.log('🆕 MÉDICOS - Creando nuevo médico');
        const newMedico = await medicosService.createMedico(formData);
        console.log('✅ MÉDICOS - Médico creado exitosamente:', newMedico);
        dispatch({ type: 'ADD_MEDICO', payload: newMedico });
        showSnackbar('Médico creado exitosamente', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('❌ MÉDICOS - Error en operación:', error);
      console.error('❌ MÉDICOS - Datos que causaron el error:', formData);
      showSnackbar('Error al guardar médico', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este médico?')) {
      console.log('🗑️ MÉDICOS - Eliminando médico ID:', id);
      try {
        setLoading(true);
        await medicosService.deleteMedico(id);
        console.log('✅ MÉDICOS - Médico eliminado exitosamente');
        dispatch({ type: 'SET_MEDICOS', payload: state.medicos.filter(m => m.id !== id) });
        showSnackbar('Médico eliminado exitosamente', 'success');
      } catch (error) {
        console.error('❌ MÉDICOS - Error al eliminar:', error);
        showSnackbar('Error al eliminar médico', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredMedicos = state.medicos.filter(medico => {
    const matchesSearch = 
      medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.matricula.includes(searchTerm) ||
      medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecialidad = especialidadFilter === '' || medico.especialidad === especialidadFilter;
    
    return matchesSearch && matchesEspecialidad;
  });

  const getStatusColor = (activo: boolean) => {
    return activo ? 'success' : 'error';
  };

  const getStatusLabel = (activo: boolean) => {
    return activo ? 'Activo' : 'Inactivo';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Médicos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Médico
        </Button>
      </Box>

      {/* Filtros de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, apellido, matrícula o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por Especialidad</InputLabel>
                <Select
                  value={especialidadFilter}
                  label="Filtrar por Especialidad"
                  onChange={(e) => setEspecialidadFilter(e.target.value)}
                >
                  <MenuItem value="">Todas las especialidades</MenuItem>
                  {especialidades.map((especialidad) => (
                    <MenuItem key={especialidad} value={especialidad}>
                      {especialidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de médicos */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredMedicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No se encontraron médicos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicos.map((medico) => (
                    <TableRow key={medico.id}>
                      <TableCell>
                        <Chip 
                          label={medico.matricula} 
                          size="small" 
                          color="primary"
                          icon={<LocalHospitalIcon />}
                        />
                      </TableCell>
                      <TableCell>{medico.nombre}</TableCell>
                      <TableCell>{medico.apellido}</TableCell>
                      <TableCell>
                        <Chip 
                          label={medico.especialidad} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{medico.email}</TableCell>
                      <TableCell>{medico.telefono}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(medico.activo)}
                          color={getStatusColor(medico.activo)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(medico)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(medico.id)}
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
          {editingMedico ? 'Editar Médico' : 'Nuevo Médico'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <TextField
                fullWidth
                label="Matrícula"
                value={formData.matricula}
                onChange={(e) => handleInputChange('matricula', e.target.value)}
                required
                helperText="Solo números (6-10 dígitos)"
                error={formData.matricula !== '' && !/^\d{6,10}$/.test(formData.matricula)}
                inputProps={{
                  maxLength: 10,
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
              <FormControl fullWidth required>
                <InputLabel>Especialidad</InputLabel>
                <Select
                  value={formData.especialidad}
                  label="Especialidad"
                  onChange={(e) => handleInputChange('especialidad', e.target.value)}
                >
                  {especialidades.map((especialidad) => (
                    <MenuItem key={especialidad} value={especialidad}>
                      {especialidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={(e) => handleInputChange('activo', e.target.checked)}
                    color="primary"
                  />
                }
                label="Médico Activo"
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
            {loading ? <CircularProgress size={20} /> : (editingMedico ? 'Actualizar' : 'Crear')}
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
