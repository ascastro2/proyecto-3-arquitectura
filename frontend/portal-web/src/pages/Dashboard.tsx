import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as LocalHospitalIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';
import { pacientesService } from '../services/pacientesService';
import { medicosService } from '../services/medicosService';
import { turnosService } from '../services/turnosService';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            p: 1,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Cargar datos en paralelo
        const [pacientes, medicos, turnos] = await Promise.all([
          pacientesService.getAllPacientes(),
          medicosService.getAllMedicos(),
          turnosService.getAllTurnos(),
        ]);

        dispatch({ type: 'SET_PACIENTES', payload: pacientes });
        dispatch({ type: 'SET_MEDICOS', payload: medicos });
        dispatch({ type: 'SET_TURNOS', payload: turnos.turnos });
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Error al cargar datos del dashboard' });
      } finally {
        setLoading(false);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadDashboardData();
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  const totalPacientes = state.pacientes.length;
  const totalMedicos = state.medicos.length;
  const totalTurnos = state.turnos.length;
  
  const turnosConfirmados = state.turnos.filter(t => t.estado === 'CONFIRMADO').length;
  const turnosPendientes = state.turnos.filter(t => t.estado === 'PENDIENTE').length;
  const turnosCancelados = state.turnos.filter(t => t.estado === 'CANCELADO').length;

  const porcentajeConfirmados = totalTurnos > 0 ? (turnosConfirmados / totalTurnos) * 100 : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard del Sistema
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <StatsCard
            title="Total Pacientes"
            value={totalPacientes}
            icon={<PeopleIcon sx={{ color: 'white' }} />}
            color="#1976d2"
            subtitle="Pacientes registrados"
          />
        </Box>
        
        <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <StatsCard
            title="Total Médicos"
            value={totalMedicos}
            icon={<LocalHospitalIcon sx={{ color: 'white' }} />}
            color="#2e7d32"
            subtitle="Médicos activos"
          />
        </Box>
        
        <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <StatsCard
            title="Total Turnos"
            value={totalTurnos}
            icon={<ScheduleIcon sx={{ color: 'white' }} />}
            color="#ed6c02"
            subtitle="Turnos programados"
          />
        </Box>
        
        <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <StatsCard
            title="Notificaciones"
            value={state.notificaciones.length}
            icon={<NotificationsIcon sx={{ color: 'white' }} />}
            color="#9c27b0"
            subtitle="Generadas automáticamente"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado de Turnos
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Confirmados</Typography>
                  <Typography variant="body2">{turnosConfirmados}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={porcentajeConfirmados}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Pendientes: ${turnosPendientes}`}
                  color="warning"
                  size="small"
                />
                <Chip
                  label={`Cancelados: ${turnosCancelados}`}
                  color="error"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ minWidth: 400, flex: '1 1 400px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2" color="text.secondary">
                    Último paciente registrado
                  </Typography>
                  <Typography variant="body1">
                    {state.pacientes.length > 0 
                      ? `${state.pacientes[state.pacientes.length - 1].nombre} ${state.pacientes[state.pacientes.length - 1].apellido}`
                      : 'Ninguno'
                    }
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2" color="text.secondary">
                    Último turno creado
                  </Typography>
                  <Typography variant="body1">
                    {state.turnos.length > 0 
                      ? `Turno #${state.turnos[state.turnos.length - 1].id} - ${state.turnos[state.turnos.length - 1].estado}`
                      : 'Ninguno'
                    }
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
