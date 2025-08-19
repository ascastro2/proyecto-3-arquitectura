import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventAvailable as EventAvailableIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

interface HistorialCambio {
  id: number;
  turnoId: number;
  tipoCambio: string;
  descripcion: string;
  usuarioId: number | null;
  datosAnteriores: any;
  datosNuevos: any;
  fechaCambio: string;
  pacienteId?: number;
  medicoId?: number;
}

const tiposCambio = [
  { value: 'creacion', label: 'Creación de Turno', color: 'success' as const, icon: ScheduleIcon },
  { value: 'modificacion', label: 'Modificación de Turno', color: 'warning' as const, icon: EditIcon },
  { value: 'confirmacion', label: 'Confirmación de Turno', color: 'info' as const, icon: CheckCircleIcon },
  { value: 'cancelacion', label: 'Cancelación de Turno', color: 'error' as const, icon: CancelIcon },
  { value: 'completado', label: 'Turno Completado', color: 'primary' as const, icon: EventAvailableIcon },
  { value: 'no_show', label: 'Marcado como No Show', color: 'default' as const, icon: WarningIcon },
];

export default function Historial() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedCambio, setSelectedCambio] = useState<HistorialCambio | null>(null);

  // Mock data para historial (en un sistema real vendría del backend)
  const [historial, setHistorial] = useState<HistorialCambio[]>([
    {
      id: 1,
      turnoId: 1,
      tipoCambio: 'creacion',
      descripcion: 'Se creó un nuevo turno para el paciente Juan Pérez con el Dr. Carlos Rodríguez',
      usuarioId: 1,
      datosAnteriores: null,
      datosNuevos: {
        pacienteId: 1,
        medicoId: 1,
        fecha: '2024-01-15',
        hora: '10:00',
        motivo: 'Control cardiológico'
      },
      fechaCambio: new Date().toISOString(),
      pacienteId: 1,
      medicoId: 1
    },
    {
      id: 2,
      turnoId: 1,
      tipoCambio: 'confirmacion',
      descripcion: 'El turno fue confirmado por el paciente',
      usuarioId: 1,
      datosAnteriores: { estado: 'PENDIENTE' },
      datosNuevos: { estado: 'CONFIRMADO' },
      fechaCambio: new Date(Date.now() - 86400000).toISOString(),
      pacienteId: 1,
      medicoId: 1
    },
    {
      id: 3,
      turnoId: 2,
      tipoCambio: 'creacion',
      descripcion: 'Se creó un nuevo turno para el paciente María González con el Dr. Ana López',
      usuarioId: 1,
      datosAnteriores: null,
      datosNuevos: {
        pacienteId: 2,
        medicoId: 2,
        fecha: '2024-01-20',
        hora: '14:00',
        motivo: 'Consulta dermatológica'
      },
      fechaCambio: new Date(Date.now() - 172800000).toISOString(),
      pacienteId: 2,
      medicoId: 2
    },
    {
      id: 4,
      turnoId: 2,
      tipoCambio: 'cancelacion',
      descripcion: 'El turno fue cancelado por cambio de horario solicitado por el médico',
      usuarioId: 1,
      datosAnteriores: { estado: 'CONFIRMADO' },
      datosNuevos: { 
        estado: 'CANCELADO',
        motivoCancelacion: 'Cambio de horario solicitado por el médico'
      },
      fechaCambio: new Date(Date.now() - 259200000).toISOString(),
      pacienteId: 2,
      medicoId: 2
    },
    {
      id: 5,
      turnoId: 3,
      tipoCambio: 'creacion',
      descripcion: 'Se creó un nuevo turno para el paciente Roberto Silva con el Dr. Carlos Rodríguez',
      usuarioId: 1,
      datosAnteriores: null,
      datosNuevos: {
        pacienteId: 3,
        medicoId: 1,
        fecha: '2024-01-25',
        hora: '11:00',
        motivo: 'Control de presión arterial'
      },
      fechaCambio: new Date(Date.now() - 345600000).toISOString(),
      pacienteId: 3,
      medicoId: 1
    },
    {
      id: 6,
      turnoId: 3,
      tipoCambio: 'completado',
      descripcion: 'El turno fue marcado como completado',
      usuarioId: 1,
      datosAnteriores: { estado: 'CONFIRMADO' },
      datosNuevos: { estado: 'COMPLETADO' },
      fechaCambio: new Date(Date.now() - 432000000).toISOString(),
      pacienteId: 3,
      medicoId: 1
    }
  ]);

  const loadHistorial = useCallback(async () => {
    try {
      setLoading(true);
      // En un sistema real, aquí se haría la llamada al servicio
      // const hist = await historialService.getAllHistorial();
      // setHistorial(hist);
      
      // Simulamos un delay para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por ahora usamos los datos mock
      dispatch({ type: 'SET_HISTORIAL', payload: historial });
    } catch (error) {
      showSnackbar('Error al cargar historial', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistorial();
  }, [loadHistorial]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getTipoLabel = (tipo: string) => {
    const tipoObj = tiposCambio.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  const getTipoColor = (tipo: string) => {
    const tipoObj = tiposCambio.find(t => t.value === tipo);
    return tipoObj ? tipoObj.color : 'default';
  };

  const getTipoIcon = (tipo: string) => {
    const tipoObj = tiposCambio.find(t => t.value === tipo);
    return tipoObj ? tipoObj.icon : ScheduleIcon;
  };

  const getPacienteNombre = (pacienteId?: number): string => {
    if (!pacienteId) return 'N/A';
    const paciente = state.pacientes.find(p => p.id === pacienteId);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'N/A';
  };

  const getMedicoNombre = (medicoId?: number): string => {
    if (!medicoId) return 'N/A';
    const medico = state.medicos.find(m => m.id === medicoId);
    return medico ? `Dr. ${medico.nombre} ${medico.apellido}` : 'N/A';
  };

  const filteredHistorial = historial.filter(cambio => {
    const matchesSearch = 
      cambio.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPacienteNombre(cambio.pacienteId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMedicoNombre(cambio.medicoId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === '' || cambio.tipoCambio === tipoFilter;
    
    let matchesFecha = true;
    if (fechaDesde && fechaHasta) {
      const fechaCambio = new Date(cambio.fechaCambio);
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59); // Incluir todo el día hasta
      matchesFecha = fechaCambio >= desde && fechaCambio <= hasta;
    }
    
    return matchesSearch && matchesTipo && matchesFecha;
  });

  const getEstadisticasHistorial = () => {
    const total = historial.length;
    const creaciones = historial.filter(h => h.tipoCambio === 'creacion').length;
    const modificaciones = historial.filter(h => h.tipoCambio === 'modificacion').length;
    const confirmaciones = historial.filter(h => h.tipoCambio === 'confirmacion').length;
    const cancelaciones = historial.filter(h => h.tipoCambio === 'cancelacion').length;
    const completados = historial.filter(h => h.tipoCambio === 'completado').length;
    
    return { total, creaciones, modificaciones, confirmaciones, cancelaciones, completados };
  };

  const stats = getEstadisticasHistorial();

  const handleVerDetalle = (cambio: HistorialCambio) => {
    setSelectedCambio(cambio);
    setOpenDetailDialog(true);
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaCorta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          Historial de Cambios
        </Typography>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={loadHistorial}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* Estadísticas */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.total}</Typography>
            <Typography variant="body2">Total Cambios</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.creaciones}</Typography>
            <Typography variant="body2">Creaciones</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.modificaciones}</Typography>
            <Typography variant="body2">Modificaciones</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.confirmaciones}</Typography>
            <Typography variant="body2">Confirmaciones</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.cancelaciones}</Typography>
            <Typography variant="body2">Cancelaciones</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.completados}</Typography>
            <Typography variant="body2">Completados</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar por descripción, paciente o médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Tipo de Cambio</InputLabel>
              <Select
                value={tipoFilter}
                label="Tipo de Cambio"
                onChange={(e) => setTipoFilter(e.target.value)}
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                {tiposCambio.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de historial */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Turno</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Paciente</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Médico</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Cargando historial...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredHistorial.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm || tipoFilter || fechaDesde || fechaHasta 
                          ? 'No se encontraron cambios con los filtros aplicados' 
                          : 'No hay cambios registrados'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistorial.map((cambio) => {
                    const TipoIcon = getTipoIcon(cambio.tipoCambio);
                    return (
                      <TableRow key={cambio.id} hover>
                        <TableCell>
                          <Chip 
                            label={`#${cambio.id}`} 
                            size="small" 
                            color="primary"
                            icon={<HistoryIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTipoLabel(cambio.tipoCambio)}
                            color={getTipoColor(cambio.tipoCambio)}
                            size="small"
                            variant="filled"
                            icon={<TipoIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`Turno #${cambio.turnoId}`} 
                            size="small" 
                            color="secondary"
                            icon={<ScheduleIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {getPacienteNombre(cambio.pacienteId)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <LocalHospitalIcon color="action" fontSize="small" />
                            <Typography variant="body2">
                              {getMedicoNombre(cambio.medicoId)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {cambio.descripcion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatFechaCorta(cambio.fechaCambio)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver Detalle">
                            <IconButton
                              size="small"
                              onClick={() => handleVerDetalle(cambio)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Diálogo de detalle */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryIcon color="primary" />
            Detalle del Cambio
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedCambio && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="text.secondary">ID del Cambio</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    #{selectedCambio.id}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="text.secondary">ID del Turno</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    #{selectedCambio.turnoId}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="text.secondary">Tipo de Cambio</Typography>
                  <Chip
                    label={getTipoLabel(selectedCambio.tipoCambio)}
                    color={getTipoColor(selectedCambio.tipoCambio)}
                    size="small"
                    icon={React.createElement(getTipoIcon(selectedCambio.tipoCambio))}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="text.secondary">Usuario</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedCambio.usuarioId ? `Usuario #${selectedCambio.usuarioId}` : 'Sistema'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
                  <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {selectedCambio.descripcion}
                  </Typography>
                </Box>
                
                <Box sx={{ flex: '1 1 100%' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>Información del Turno</Typography>
                </Box>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="text.secondary">Paciente</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {getPacienteNombre(selectedCambio.pacienteId)}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                  <Typography variant="subtitle2" color="text.secondary">Médico</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {getMedicoNombre(selectedCambio.medicoId)}
                  </Typography>
                </Box>
                
                {selectedCambio.datosAnteriores && (
                  <>
                    <Box sx={{ flex: '1 1 100%' }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ mb: 2 }}>Datos Anteriores</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 100%' }}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">Ver datos anteriores</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <pre style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: '16px', 
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '14px'
                          }}>
                            {JSON.stringify(selectedCambio.datosAnteriores, null, 2)}
                          </pre>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </>
                )}
                
                {selectedCambio.datosNuevos && (
                  <>
                    <Box sx={{ flex: '1 1 100%' }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ mb: 2 }}>Datos Nuevos</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 100%' }}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">Ver datos nuevos</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <pre style={{ 
                            backgroundColor: '#e8f5e8', 
                            padding: '16px', 
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '14px'
                          }}>
                            {JSON.stringify(selectedCambio.datosNuevos, null, 2)}
                          </pre>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </>
                )}
                
                <Box sx={{ flex: '1 1 100%' }}>
                  <Typography variant="subtitle2" color="text.secondary">Fecha del Cambio</Typography>
                  <Typography variant="body1">
                    {formatFecha(selectedCambio.fechaCambio)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDetailDialog(false)} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
