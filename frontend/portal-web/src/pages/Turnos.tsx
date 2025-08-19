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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  DialogContentText,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventAvailable as EventAvailableIcon,
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { turnosService } from '../services/turnosService';
import { pacientesService } from '../services/pacientesService';
import { medicosService } from '../services/medicosService';
import { Turno } from '../contexts/AppContext';

interface TurnoFormData {
  pacienteId: number;
  medicoId: number;
  fecha: string;
  hora: string;
  diaSemana: number;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO' | 'NO_SHOW';
  motivo: string;
  observaciones: string;
}

const initialFormData: TurnoFormData = {
  pacienteId: 0,
  medicoId: 0,
  fecha: '',
  hora: '',
  diaSemana: 0,
  estado: 'PENDIENTE',
  motivo: '',
  observaciones: '',
};

const horasDisponibles = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const estadosTurno = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'warning' as const },
  { value: 'CONFIRMADO', label: 'Confirmado', color: 'success' as const },
  { value: 'CANCELADO', label: 'Cancelado', color: 'error' as const },
  { value: 'COMPLETADO', label: 'Completado', color: 'info' as const },
  { value: 'NO_SHOW', label: 'No Show', color: 'default' as const },
];

export default function Turnos() {
  const { state, dispatch } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null);
  const [formData, setFormData] = useState<TurnoFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [turnoToCancel, setTurnoToCancel] = useState<Turno | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadPacientes = async () => {
    try {
      console.log('🔄 TURNOS - Cargando pacientes...');
      const pacientes = await pacientesService.getAllPacientes();
      console.log('✅ TURNOS - Pacientes cargados:', pacientes.length);
      dispatch({ type: 'SET_PACIENTES', payload: pacientes });
    } catch (error) {
      console.error('❌ TURNOS - Error al cargar pacientes:', error);
      showSnackbar('Error al cargar pacientes', 'error');
    }
  };

  const loadMedicos = async () => {
    try {
      console.log('🔄 TURNOS - Cargando médicos...');
      const medicos = await medicosService.getAllMedicos();
      console.log('✅ TURNOS - Médicos cargados:', medicos.length);
      dispatch({ type: 'SET_MEDICOS', payload: medicos });
    } catch (error) {
      console.error('❌ TURNOS - Error al cargar médicos:', error);
      showSnackbar('Error al cargar médicos', 'error');
    }
  };

  const loadTurnos = async () => {
    try {
      console.log('🔄 TURNOS - Cargando turnos...');
      const turnos = await turnosService.getAllTurnos();
      console.log('✅ TURNOS - Turnos cargados:', turnos.turnos.length);
      dispatch({ type: 'SET_TURNOS', payload: turnos.turnos });
    } catch (error) {
      console.error('❌ TURNOS - Error al cargar turnos:', error);
      showSnackbar('Error al cargar turnos', 'error');
    }
  };

  const loadAllData = async () => {
    try {
      console.log('🚀 TURNOS - Iniciando carga de todos los datos...');
      setInitialLoading(true);
      await Promise.all([
        loadPacientes(),
        loadMedicos(),
        loadTurnos()
      ]);
      console.log('✅ TURNOS - Todos los datos cargados exitosamente');
      console.log('📊 TURNOS - Estado actual:', {
        pacientes: state.pacientes.length,
        medicos: state.medicos.length,
        turnos: state.turnos.length
      });
    } catch (error) {
      console.error('❌ TURNOS - Error al cargar datos:', error);
      showSnackbar('Error al cargar datos', 'error');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 TURNOS - useEffect ejecutado, cargando datos...');
    loadAllData();
  }, []);

  const handleOpenDialog = (turno?: Turno) => {
    if (turno) {
      setEditingTurno(turno);
      setFormData({
        pacienteId: turno.pacienteId,
        medicoId: turno.medicoId,
        fecha: turno.fecha.split('T')[0],
        hora: turno.hora,
        diaSemana: turno.diaSemana,
        estado: turno.estado,
        motivo: turno.motivo,
        observaciones: turno.observaciones,
      });
    } else {
      setEditingTurno(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTurno(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field: keyof TurnoFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validar campos básicos
    if (formData.pacienteId <= 0 || formData.medicoId <= 0) {
      return false;
    }

    if (formData.fecha === '' || formData.hora === '') {
      return false;
    }

    if (formData.motivo.trim() === '') {
      return false;
    }

    // Validar que la fecha sea futura
    const fechaTurno = new Date(`${formData.fecha}T${formData.hora}`);
    const ahora = new Date();
    
    if (fechaTurno <= ahora) {
      return false;
    }

    // Validar que no sea domingo (día 0)
    if (formData.diaSemana === 0) {
      return false;
    }

    // Validar horario de atención (8:00 - 18:00)
    const hora = parseInt(formData.hora.split(':')[0]);
    if (hora < 8 || hora > 18) {
      return false;
    }

    return true;
  };

  // Validación pura para el botón (sin setState)
  const canSubmit = React.useMemo(() => {
    return formData.pacienteId > 0 && 
           formData.medicoId > 0 && 
           formData.fecha !== '' && 
           formData.hora !== '' && 
           formData.motivo.trim() !== '' &&
           formData.diaSemana !== 0;
  }, [formData.pacienteId, formData.medicoId, formData.fecha, formData.hora, formData.motivo, formData.diaSemana]);

  const validateFormWithMessages = (): boolean => {
    // Validar campos básicos
    if (formData.pacienteId <= 0 || formData.medicoId <= 0) {
      showSnackbar('Debe seleccionar un paciente y un médico', 'error');
      return false;
    }

    if (formData.fecha === '' || formData.hora === '') {
      showSnackbar('Debe seleccionar fecha y hora', 'error');
      return false;
    }

    if (formData.motivo.trim() === '') {
      showSnackbar('El motivo de la consulta es obligatorio', 'error');
      return false;
    }

    // Validar que la fecha sea futura
    const fechaTurno = new Date(`${formData.fecha}T${formData.hora}`);
    const ahora = new Date();
    
    if (fechaTurno <= ahora) {
      showSnackbar('La fecha y hora del turno debe ser futura', 'error');
      return false;
    }

    // Validar que no sea domingo (día 0)
    if (formData.diaSemana === 0) {
      showSnackbar('No se pueden agendar turnos en domingo', 'error');
      return false;
    }

    // Validar horario de atención (8:00 - 18:00)
    const hora = parseInt(formData.hora.split(':')[0]);
    if (hora < 8 || hora > 18) {
      showSnackbar('Los turnos deben estar entre las 8:00 y 18:00', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateFormWithMessages()) {
      return;
    }

    // Log de datos que se van a enviar
    console.log('🚀 TURNOS - Datos a enviar:', {
      operacion: editingTurno ? 'ACTUALIZAR' : 'CREAR',
      datos: formData,
      timestamp: new Date().toISOString()
    });

    try {
      setLoading(true);
      if (editingTurno) {
        console.log('📝 TURNOS - Actualizando turno ID:', editingTurno.id);
        const updatedTurno = await turnosService.updateTurno(editingTurno.id, formData);
        console.log('✅ TURNOS - Turno actualizado exitosamente:', updatedTurno);
        dispatch({ type: 'UPDATE_TURNO', payload: updatedTurno });
        showSnackbar('Turno actualizado exitosamente', 'success');
      } else {
        console.log('🆕 TURNOS - Creando nuevo turno');
        const newTurno = await turnosService.createTurno(formData);
        console.log('✅ TURNOS - Turno creado exitosamente:', newTurno);
        dispatch({ type: 'ADD_TURNO', payload: newTurno });
        showSnackbar('Turno creado exitosamente', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('❌ TURNOS - Error en operación:', error);
      console.error('❌ TURNOS - Datos que causaron el error:', formData);
      showSnackbar('Error al guardar turno', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async (turno: Turno) => {
    console.log('✅ TURNOS - Confirmando turno ID:', turno.id);
    try {
      setLoading(true);
      const updatedTurno = await turnosService.confirmarTurno(turno.id);
      console.log('✅ TURNOS - Turno confirmado exitosamente:', updatedTurno);
      dispatch({ type: 'UPDATE_TURNO', payload: updatedTurno });
      showSnackbar('Turno confirmado exitosamente', 'success');
    } catch (error) {
      console.error('❌ TURNOS - Error al confirmar turno:', error);
      showSnackbar('Error al confirmar turno', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (turno: Turno, motivo: string) => {
    console.log('❌ TURNOS - Cancelando turno ID:', turno.id, 'con motivo:', motivo);
    try {
      setLoading(true);
      const updatedTurno = await turnosService.cancelarTurno(turno.id, motivo);
      console.log('✅ TURNOS - Turno cancelado exitosamente:', updatedTurno);
      dispatch({ type: 'UPDATE_TURNO', payload: updatedTurno });
      showSnackbar('Turno cancelado exitosamente', 'success');
    } catch (error) {
      console.error('❌ TURNOS - Error al cancelar turno:', error);
      showSnackbar('Error al cancelar turno', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletar = async (turno: Turno) => {
    console.log('🏁 TURNOS - Completando turno ID:', turno.id);
    try {
      setLoading(true);
      const updatedTurno = await turnosService.completarTurno(turno.id);
      console.log('✅ TURNOS - Turno completado exitosamente:', updatedTurno);
      dispatch({ type: 'UPDATE_TURNO', payload: updatedTurno });
      showSnackbar('Turno completado exitosamente', 'success');
    } catch (error) {
      console.error('❌ TURNOS - Error al completar turno:', error);
      showSnackbar('Error al completar turno', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNoShow = async (turno: Turno) => {
    console.log('🚫 TURNOS - Marcando turno como NO SHOW ID:', turno.id);
    try {
      setLoading(true);
      const updatedTurno = await turnosService.marcarNoShow(turno.id);
      console.log('✅ TURNOS - Turno marcado como NO SHOW exitosamente:', updatedTurno);
      dispatch({ type: 'UPDATE_TURNO', payload: updatedTurno });
      showSnackbar('Turno marcado como NO SHOW', 'success');
    } catch (error) {
      console.error('❌ TURNOS - Error al marcar NO SHOW:', error);
      showSnackbar('Error al marcar NO SHOW', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPacienteNombre = React.useCallback((pacienteId: number): string => {
    const paciente = state.pacientes.find(p => p.id === pacienteId);
    const nombre = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'N/A';
    console.log(`🔍 TURNOS - Buscando paciente ID ${pacienteId}:`, nombre);
    return nombre;
  }, [state.pacientes]);

  const getMedicoNombre = React.useCallback((medicoId: number): string => {
    const medico = state.medicos.find(m => m.id === medicoId);
    const nombre = medico ? `Dr. ${medico.nombre} ${medico.apellido} - ${medico.especialidad}` : 'N/A';
    console.log(`🔍 TURNOS - Buscando médico ID ${medicoId}:`, nombre);
    return nombre;
  }, [state.medicos]);

  const getEstadoColor = React.useCallback((estado: string) => {
    const estadoObj = estadosTurno.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : 'default';
  }, []);

  const getEstadoLabel = React.useCallback((estado: string) => {
    const estadoObj = estadosTurno.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }, []);

  const filteredTurnos = React.useMemo(() => {
    console.log('🔍 TURNOS - Filtrando turnos:', {
      total: state.turnos.length,
      searchTerm,
      estadoFilter
    });
    
    return state.turnos.filter(turno => {
      const matchesSearch = 
        getPacienteNombre(turno.pacienteId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getMedicoNombre(turno.medicoId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        turno.motivo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = estadoFilter === '' || turno.estado === estadoFilter;
      
      return matchesSearch && matchesEstado;
    });
  }, [state.turnos, searchTerm, estadoFilter, getPacienteNombre, getMedicoNombre]);

  const stats = React.useMemo(() => {
    const total = state.turnos.length;
    const pendientes = state.turnos.filter(t => t.estado === 'PENDIENTE').length;
    const confirmados = state.turnos.filter(t => t.estado === 'CONFIRMADO').length;
    const cancelados = state.turnos.filter(t => t.estado === 'CANCELADO').length;
    const completados = state.turnos.filter(t => t.estado === 'COMPLETADO').length;
    
    console.log('📊 TURNOS - Estadísticas calculadas:', { total, pendientes, confirmados, cancelados, completados });
    
    return { total, pendientes, confirmados, cancelados, completados };
  }, [state.turnos]);

  return (
    <Box>
      {/* Header con estadísticas */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Gestión de Turnos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={loadAllData}
            disabled={initialLoading}
            startIcon={<ScheduleIcon />}
          >
            Recargar Datos
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Nuevo Turno
          </Button>
        </Box>
      </Box>

      {/* Indicador de carga inicial */}
      {initialLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando datos iniciales...
          </Typography>
        </Box>
      )}

      {/* Contenido principal - solo mostrar cuando se hayan cargado los datos */}
      {!initialLoading && (
        <>
          {/* Estadísticas rápidas */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'white', minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">{stats.total}</Typography>
                <Typography variant="body2">Total Turnos</Typography>
              </CardContent>
            </Card>
            <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white', minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">{stats.pendientes}</Typography>
                <Typography variant="body2">Pendientes</Typography>
              </CardContent>
            </Card>
            <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white', minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">{stats.confirmados}</Typography>
                <Typography variant="body2">Confirmados</Typography>
              </CardContent>
            </Card>
            <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'white', minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">{stats.completados}</Typography>
                <Typography variant="body2">Completados</Typography>
              </CardContent>
            </Card>
            <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: 'white', minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">{stats.cancelados}</Typography>
                <Typography variant="body2">Cancelados</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Filtros de búsqueda */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Buscar por paciente, médico o motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ flex: 1, minWidth: 300 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filtrar por Estado</InputLabel>
                  <Select
                    value={estadoFilter}
                    label="Filtrar por Estado"
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="">Todos los estados</MenuItem>
                    {estadosTurno.map((estado) => (
                      <MenuItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>

          {/* Tabla de turnos */}
          <Card>
            <CardContent>
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Paciente</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Médico</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hora</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Motivo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <CircularProgress />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Cargando turnos...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredTurnos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            {searchTerm || estadoFilter ? 'No se encontraron turnos con los filtros aplicados' : 'No hay turnos registrados'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTurnos.map((turno) => (
                        <TableRow key={turno.id} hover>
                          <TableCell>
                            <Chip 
                              label={`#${turno.id}`} 
                              size="small" 
                              color="primary"
                              icon={<ScheduleIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PersonIcon color="action" fontSize="small" />
                              <Typography variant="body2">
                                {getPacienteNombre(turno.pacienteId)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LocalHospitalIcon color="action" fontSize="small" />
                              <Typography variant="body2">
                                {getMedicoNombre(turno.medicoId)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <CalendarTodayIcon color="action" fontSize="small" />
                              <Typography variant="body2">
                                {new Date(turno.fecha).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <AccessTimeIcon color="action" fontSize="small" />
                              <Typography variant="body2" fontWeight="bold">
                                {turno.hora}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getEstadoLabel(turno.estado)}
                              color={getEstadoColor(turno.estado)}
                              size="small"
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {turno.motivo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {turno.estado === 'PENDIENTE' && (
                                <>
                                  <Tooltip title="Confirmar Turno">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleConfirmar(turno)}
                                      color="success"
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancelar Turno">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setTurnoToCancel(turno);
                                        setOpenCancelDialog(true);
                                      }}
                                      color="error"
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              
                              {turno.estado === 'CONFIRMADO' && (
                                <>
                                  <Tooltip title="Marcar como Completado">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCompletar(turno)}
                                      color="info"
                                    >
                                      <EventAvailableIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Marcar como No Show">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleNoShow(turno)}
                                      color="warning"
                                    >
                                      <CancelIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              
                              <Tooltip title="Editar Turno">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(turno)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Diálogo de formulario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ScheduleIcon color="primary" />
            {editingTurno ? 'Editar Turno' : 'Nuevo Turno'}
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <FormControl fullWidth required sx={{ minWidth: 250, flex: '1 1 300px' }}>
              <InputLabel>Paciente</InputLabel>
              <Select
                value={formData.pacienteId}
                label="Paciente"
                onChange={(e) => handleInputChange('pacienteId', Number(e.target.value))}
              >
                {state.pacientes.map((paciente) => (
                  <MenuItem key={paciente.id} value={paciente.id}>
                    {paciente.dni} - {paciente.nombre} {paciente.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required sx={{ minWidth: 250, flex: '1 1 300px' }}>
              <InputLabel>Médico</InputLabel>
              <Select
                value={formData.medicoId}
                label="Médico"
                onChange={(e) => handleInputChange('medicoId', Number(e.target.value))}
              >
                {state.medicos.filter(m => m.activo).map((medico) => (
                  <MenuItem key={medico.id} value={medico.id}>
                    {medico.matricula} - Dr. {medico.nombre} {medico.apellido} ({medico.especialidad})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ minWidth: 250, flex: '1 1 300px' }}
            />
            <FormControl fullWidth required sx={{ minWidth: 250, flex: '1 1 300px' }}>
              <InputLabel>Hora</InputLabel>
              <Select
                value={formData.hora}
                label="Hora"
                onChange={(e) => handleInputChange('hora', e.target.value)}
              >
                {horasDisponibles.map((hora) => (
                  <MenuItem key={hora} value={hora}>
                    {hora}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required sx={{ minWidth: 250, flex: '1 1 300px' }}>
              <InputLabel>Día de la Semana</InputLabel>
              <Select
                value={formData.diaSemana}
                label="Día de la Semana"
                onChange={(e) => handleInputChange('diaSemana', Number(e.target.value))}
              >
                {diasSemana.map((dia) => (
                  <MenuItem key={dia.value} value={dia.value}>
                    {dia.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 250, flex: '1 1 300px' }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                label="Estado"
                onChange={(e) => handleInputChange('estado', e.target.value)}
              >
                {estadosTurno.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Motivo de la Consulta"
              value={formData.motivo}
              onChange={(e) => handleInputChange('motivo', e.target.value)}
              required
              helperText="Descripción del motivo de la consulta"
              sx={{ flex: '1 1 100%' }}
            />
            <TextField
              fullWidth
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              multiline
              rows={3}
              helperText="Observaciones adicionales sobre el turno"
              sx={{ flex: '1 1 100%' }}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !canSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {loading ? 'Guardando...' : (editingTurno ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de cancelación */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CancelIcon color="error" />
            Cancelar Turno
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ¿Está seguro de que desea cancelar este turno? Esta acción generará una notificación automática.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo de la cancelación"
            fullWidth
            variant="outlined"
            value={motivoCancelacion}
            onChange={(e) => setMotivoCancelacion(e.target.value)}
            required
            helperText="Es obligatorio especificar el motivo de la cancelación"
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCancelDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button 
                            onClick={() => handleCancelar(turnoToCancel!, motivoCancelacion)} 
            variant="contained" 
            color="error"
            disabled={loading || !motivoCancelacion.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
