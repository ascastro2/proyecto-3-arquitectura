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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Email as EmailIconSmall,
  Phone as PhoneIconSmall,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { notificacionesService, Notificacion } from '../services/notificacionesService';

const tiposNotificacion = [
  { value: 'confirmacion', label: 'Confirmación de Cita', color: 'success' as const },
  { value: 'cancelacion', label: 'Cancelación de Cita', color: 'error' as const },
  { value: 'modificacion', label: 'Modificación de Cita', color: 'warning' as const },
  { value: 'recordatorio', label: 'Recordatorio de Cita', color: 'info' as const },
  { value: 'general', label: 'Notificación General', color: 'default' as const },
];

const canalesNotificacion = [
  { value: 'EMAIL', label: 'Email', icon: EmailIconSmall },
  { value: 'SMS', label: 'SMS', icon: PhoneIconSmall },
];

const estadosNotificacion = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'warning' as const },
  { value: 'ENVIADA', label: 'Enviada', color: 'success' as const },
  { value: 'ERROR', label: 'Error', color: 'error' as const },
];

export default function Notificaciones() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [canalFilter, setCanalFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedNotificacion, setSelectedNotificacion] = useState<Notificacion | null>(null);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const loadNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificacionesService.getAllNotificaciones();
      if (response.success) {
        setNotificaciones(response.data);
        dispatch({ type: 'SET_NOTIFICACIONES', payload: response.data });
        console.log('📧 NOTIFICACIONES - Datos cargados del backend:', response.data);
      } else {
        showSnackbar('Error al cargar notificaciones', 'error');
      }
    } catch (error) {
      console.error('📧 NOTIFICACIONES - Error al cargar:', error);
      showSnackbar('Error al cargar notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getTipoLabel = (tipo: string) => {
    const tipoObj = tiposNotificacion.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  const getTipoColor = (tipo: string) => {
    const tipoObj = tiposNotificacion.find(t => t.value === tipo);
    return tipoObj ? tipoObj.color : 'default';
  };

  const getCanalIcon = (canal: string) => {
    const canalObj = canalesNotificacion.find(c => c.value === canal);
    return canalObj ? canalObj.icon : EmailIconSmall;
  };

  const getCanalLabel = (canal: string) => {
    const canalObj = canalesNotificacion.find(c => c.value === canal);
    return canalObj ? canalObj.label : canal;
  };

  const getEstadoColor = (estado: string) => {
    const estadoObj = estadosNotificacion.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : 'default';
  };

  const getEstadoLabel = (estado: string) => {
    const estadoObj = estadosNotificacion.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
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

  const filteredNotificaciones = notificaciones.filter(notif => {
    const matchesSearch = 
      notif.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTipoLabel(notif.tipo).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = tipoFilter === '' || notif.tipo === tipoFilter;
    const matchesCanal = canalFilter === '' || notif.canal === canalFilter;
    const matchesEstado = estadoFilter === '' || notif.estado === estadoFilter;
    
    return matchesSearch && matchesTipo && matchesCanal && matchesEstado;
  });

  const getEstadisticasNotificaciones = () => {
    const total = notificaciones.length;
    const pendientes = notificaciones.filter(n => n.estado === 'PENDIENTE').length;
    const enviadas = notificaciones.filter(n => n.estado === 'ENVIADO').length;
    const errores = notificaciones.filter(n => n.estado === 'ERROR').length;
    const emails = notificaciones.filter(n => n.canal === 'EMAIL').length;
    const sms = notificaciones.filter(n => n.canal === 'SMS').length;
    
    return { total, pendientes, enviadas, errores, emails, sms };
  };

  const stats = getEstadisticasNotificaciones();

  const handleVerDetalle = (notificacion: Notificacion) => {
    setSelectedNotificacion(notificacion);
    setOpenDetailDialog(true);
  };

  const handleReenviar = async (notificacion: Notificacion) => {
    try {
      setLoading(true);
      // En un sistema real, aquí se haría la llamada al servicio
      // await notificacionesService.reenviarNotificacion(notificacion.id);
      
      // Simulamos el reenvío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizamos el estado local
      const notifsActualizadas = notificaciones.map(n => 
        n.id === notificacion.id 
          ? { ...n, estado: 'PENDIENTE' as const, created_at: new Date().toISOString() }
          : n
      );
      setNotificaciones(notifsActualizadas);
      
      showSnackbar('Notificación enviada para reenvío', 'success');
    } catch (error) {
      showSnackbar('Error al reenviar notificación', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon color="primary" />
          Sistema de Notificaciones
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadNotificaciones}
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
            <Typography variant="body2">Total</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.pendientes}</Typography>
            <Typography variant="body2">Pendientes</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.enviadas}</Typography>
            <Typography variant="body2">Enviadas</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'error.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.errores}</Typography>
            <Typography variant="body2">Errores</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.emails}</Typography>
            <Typography variant="body2">Emails</Typography>
          </CardContent>
        </Card>
        <Card sx={{ textAlign: 'center', bgcolor: 'secondary.light', color: 'white', minWidth: 120, flex: 1 }}>
          <CardContent>
            <Typography variant="h6">{stats.sms}</Typography>
            <Typography variant="body2">SMS</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar por contenido, destinatario o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={tipoFilter}
                label="Tipo"
                onChange={(e) => setTipoFilter(e.target.value)}
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="">Todos los tipos</MenuItem>
                {tiposNotificacion.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Canal</InputLabel>
              <Select
                value={canalFilter}
                label="Canal"
                onChange={(e) => setCanalFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {canalesNotificacion.map((canal) => (
                  <MenuItem key={canal.value} value={canal.value}>
                    {canal.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                label="Estado"
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {estadosNotificacion.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tabla de notificaciones */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Canal</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Destinatario</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Cargando notificaciones...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredNotificaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchTerm || tipoFilter || canalFilter || estadoFilter 
                          ? 'No se encontraron notificaciones con los filtros aplicados' 
                          : 'No hay notificaciones registradas'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotificaciones.map((notif) => (
                    <TableRow key={notif.id} hover>
                      <TableCell>
                        <Chip 
                          label={`#${notif.id}`} 
                          size="small" 
                          color="primary"
                          icon={<NotificationsIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTipoLabel(notif.tipo)}
                          color={getTipoColor(notif.tipo)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {React.createElement(getCanalIcon(notif.canal), { 
                            color: 'action', 
                            fontSize: 'small' 
                          })}
                          <Typography variant="body2">
                            {getCanalLabel(notif.canal)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {notif.destinatario}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getEstadoLabel(notif.estado)}
                          color={getEstadoColor(notif.estado)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(notif.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver Detalle">
                            <IconButton
                              size="small"
                              onClick={() => handleVerDetalle(notif)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {notif.estado === 'ERROR' && (
                            <Tooltip title="Reenviar">
                              <IconButton
                                size="small"
                                onClick={() => handleReenviar(notif)}
                                color="warning"
                                disabled={loading}
                              >
                                <RefreshIcon />
                              </IconButton>
                            </Tooltip>
                          )}
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

      {/* Diálogo de detalle */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <NotificationsIcon color="primary" />
            Detalle de Notificación
          </Stack>
        </DialogTitle>
        <Divider />
                 <DialogContent>
           {selectedNotificacion && (
             <Box sx={{ mt: 1 }}>
               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                 <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                   <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                   <Typography variant="body1" sx={{ mb: 2 }}>
                     #{selectedNotificacion.id}
                   </Typography>
                 </Box>
                 <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                   <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
                   <Chip
                     label={getTipoLabel(selectedNotificacion.tipo)}
                     color={getTipoColor(selectedNotificacion.tipo)}
                     size="small"
                     sx={{ mb: 2 }}
                   />
                 </Box>
                 <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                   <Typography variant="subtitle2" color="text.secondary">Canal</Typography>
                   <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                     {React.createElement(getCanalIcon(selectedNotificacion.canal), { 
                       color: 'action', 
                       fontSize: 'small' 
                     })}
                     <Typography variant="body1">
                       {getCanalLabel(selectedNotificacion.canal)}
                     </Typography>
                   </Stack>
                 </Box>
                 <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                   <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                   <Chip
                     label={getEstadoLabel(selectedNotificacion.estado)}
                     color={getEstadoColor(selectedNotificacion.estado)}
                     size="small"
                     sx={{ mb: 2 }}
                   />
                 </Box>
                 <Box sx={{ flex: '1 1 100%' }}>
                   <Typography variant="subtitle2" color="text.secondary">Destinatario</Typography>
                   <Typography variant="body1" sx={{ mb: 2 }}>
                     {selectedNotificacion.destinatario}
                   </Typography>
                 </Box>
                 <Box sx={{ flex: '1 1 100%' }}>
                   <Typography variant="subtitle2" color="text.secondary">Asunto</Typography>
                   <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                     {selectedNotificacion.asunto}
                   </Typography>
                 </Box>
                 
                 <Box sx={{ flex: '1 1 100%' }}>
                   <Typography variant="subtitle2" color="text.secondary">Contenido</Typography>
                   <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                     {selectedNotificacion.contenido}
                   </Typography>
                 </Box>
                 
                 {selectedNotificacion.pacienteId && (
                   <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                     <Typography variant="subtitle2" color="text.secondary">Paciente</Typography>
                     <Typography variant="body1" sx={{ mb: 2 }}>
                       {getPacienteNombre(selectedNotificacion.pacienteId)}
                     </Typography>
                   </Box>
                 )}
                 
                 {selectedNotificacion.medicoId && (
                   <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                     <Typography variant="subtitle2" color="text.secondary">Médico</Typography>
                     <Typography variant="body1" sx={{ mb: 2 }}>
                       {getMedicoNombre(selectedNotificacion.medicoId)}
                     </Typography>
                   </Box>
                 )}
                 
                 {selectedNotificacion.turnoId && (
                   <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                     <Typography variant="subtitle2" color="text.secondary">Turno ID</Typography>
                     <Typography variant="body1" sx={{ mb: 2 }}>
                       #{selectedNotificacion.turnoId}
                     </Typography>
                   </Box>
                 )}
                 
                 <Box sx={{ flex: '1 1 100%' }}>
                   <Typography variant="subtitle2" color="text.secondary">Fecha de Envío</Typography>
                   <Typography variant="body1">
                     {new Date(selectedNotificacion.fecha_envio).toLocaleDateString('es-ES', {
                       weekday: 'long',
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     })}
                   </Typography>
                 </Box>
                 
                 <Box sx={{ flex: '1 1 100%' }}>
                   <Typography variant="subtitle2" color="text.secondary">Fecha de Creación</Typography>
                   <Typography variant="body1">
                     {new Date(selectedNotificacion.created_at).toLocaleDateString('es-ES', {
                       weekday: 'long',
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit'
                     })}
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
          {selectedNotificacion?.estado === 'ERROR' && (
            <Button
              onClick={() => {
                handleReenviar(selectedNotificacion);
                setOpenDetailDialog(false);
              }}
              variant="contained"
              color="warning"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? 'Reenviando...' : 'Reenviar'}
            </Button>
          )}
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
