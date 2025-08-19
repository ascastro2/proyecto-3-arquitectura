import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Tipos
export interface Paciente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medico {
  id: number;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Turno {
  id: number;
  pacienteId: number;
  medicoId: number;
  fecha: string;
  hora: string;
  diaSemana: number;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO' | 'NO_SHOW';
  motivo: string;
  observaciones: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notificacion {
  id: number;
  tipo: string;
  destinatario: string;
  asunto: string;
  contenido: string;
  canal: 'EMAIL' | 'SMS';
  estado: 'PENDIENTE' | 'ENVIADO' | 'ERROR';
  fecha_envio: string;
  fecha_entrega?: string;
  intentos: number;
  error_mensaje?: string;
  created_at: string;
  updated_at: string;
  pacienteId?: number;
  medicoId?: number;
  turnoId?: number;
}

export interface HistorialCambio {
  id: number;
  turnoId: number;
  tipoCambio: string;
  descripcion: string;
  usuarioId: number | null;
  datosAnteriores: any;
  datosNuevos: any;
  fechaCambio: string;
}

// Estado inicial
interface AppState {
  pacientes: Paciente[];
  medicos: Medico[];
  turnos: Turno[];
  notificaciones: Notificacion[];
  historial: HistorialCambio[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  pacientes: [],
  medicos: [],
  turnos: [],
  notificaciones: [],
  historial: [],
  loading: false,
  error: null,
};

// Acciones
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PACIENTES'; payload: Paciente[] }
  | { type: 'ADD_PACIENTE'; payload: Paciente }
  | { type: 'UPDATE_PACIENTE'; payload: Paciente }
  | { type: 'SET_MEDICOS'; payload: Medico[] }
  | { type: 'ADD_MEDICO'; payload: Medico }
  | { type: 'UPDATE_MEDICO'; payload: Medico }
  | { type: 'SET_TURNOS'; payload: Turno[] }
  | { type: 'ADD_TURNO'; payload: Turno }
  | { type: 'UPDATE_TURNO'; payload: Turno }
  | { type: 'SET_NOTIFICACIONES'; payload: Notificacion[] }
  | { type: 'SET_HISTORIAL'; payload: HistorialCambio[] };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PACIENTES':
      return { ...state, pacientes: action.payload };
    case 'ADD_PACIENTE':
      return { ...state, pacientes: [...state.pacientes, action.payload] };
    case 'UPDATE_PACIENTE':
      return {
        ...state,
        pacientes: state.pacientes.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'SET_MEDICOS':
      return { ...state, medicos: action.payload };
    case 'ADD_MEDICO':
      return { ...state, medicos: [...state.medicos, action.payload] };
    case 'UPDATE_MEDICO':
      return {
        ...state,
        medicos: state.medicos.map(m => m.id === action.payload.id ? action.payload : m)
      };
    case 'SET_TURNOS':
      return { ...state, turnos: action.payload };
    case 'ADD_TURNO':
      return { ...state, turnos: [...state.turnos, action.payload] };
    case 'UPDATE_TURNO':
      return {
        ...state,
        turnos: state.turnos.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'SET_NOTIFICACIONES':
      return { ...state, notificaciones: action.payload };
    case 'SET_HISTORIAL':
      return { ...state, historial: action.payload };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
