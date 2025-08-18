# Migraciones de Prisma - Agendamiento Service

## Estructura de la Base de Datos

### Tabla `turnos`
- **id**: Identificador único del turno (SERIAL, PRIMARY KEY)
- **pacienteId**: ID del paciente (INTEGER, NOT NULL)
- **medicoId**: ID del médico (INTEGER, NOT NULL)
- **fecha**: Fecha del turno (DATE, NOT NULL)
- **hora**: Hora del turno (TIME, NOT NULL)
- **duracion**: Duración en minutos (INTEGER, DEFAULT 30)
- **estado**: Estado del turno (ENUM: PENDIENTE, CONFIRMADO, CANCELADO, COMPLETADO, NO_SHOW)
- **motivo**: Motivo de la consulta (TEXT)
- **observaciones**: Observaciones adicionales (TEXT)
- **createdAt**: Fecha de creación (TIMESTAMP)
- **updatedAt**: Fecha de última actualización (TIMESTAMP)

### Tabla `historial_cambios`
- **id**: Identificador único del cambio (SERIAL, PRIMARY KEY)
- **turnoId**: ID del turno relacionado (INTEGER, FOREIGN KEY)
- **tipo**: Tipo de cambio (ENUM: CREACION, MODIFICACION, CANCELACION, CONFIRMACION, COMPLETADO, NO_SHOW)
- **descripcion**: Descripción del cambio (TEXT, NOT NULL)
- **datosAnteriores**: Datos anteriores en formato JSON (JSONB)
- **datosNuevos**: Datos nuevos en formato JSON (JSONB)
- **usuarioId**: ID del usuario que realizó el cambio (INTEGER)
- **fechaCambio**: Fecha del cambio (TIMESTAMP)

## Índices y Restricciones

### Índices Únicos
- `turnos_fecha_hora_medicoId_key`: Previene turnos duplicados para el mismo médico en la misma fecha y hora

### Índices de Rendimiento
- `turnos_pacienteId_idx`: Para búsquedas por paciente
- `turnos_medicoId_idx`: Para búsquedas por médico
- `turnos_fecha_idx`: Para búsquedas por fecha
- `turnos_estado_idx`: Para filtros por estado
- `historial_cambios_turnoId_idx`: Para búsquedas de historial por turno
- `historial_cambios_tipo_idx`: Para filtros por tipo de cambio
- `historial_cambios_fechaCambio_idx`: Para búsquedas por fecha de cambio

### Claves Foráneas
- `historial_cambios.turnoId` → `turnos.id` (CASCADE DELETE)

## Comandos de Migración

### Generar una nueva migración
```bash
npx prisma migrate dev --name nombre_migracion
```

### Aplicar migraciones en producción
```bash
npx prisma migrate deploy
```

### Revertir migración
```bash
npx prisma migrate reset
```

### Ver estado de migraciones
```bash
npx prisma migrate status
```

## Notas Importantes

1. **Validación de Fechas**: La fecha del turno debe ser futura
2. **Validación de Horarios**: No pueden existir turnos superpuestos para el mismo médico
3. **Auditoría**: Todos los cambios se registran en `historial_cambios`
4. **Integridad**: Los turnos cancelados o completados no pueden ser modificados
