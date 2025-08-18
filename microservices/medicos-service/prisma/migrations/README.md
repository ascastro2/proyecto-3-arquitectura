# Migraciones de Prisma - Microservicio de Médicos

Este directorio contiene las migraciones de la base de datos para el microservicio de médicos.

## Estructura de la Base de Datos

### Tabla: `medicos`
- **id**: Identificador único del médico (SERIAL, PRIMARY KEY)
- **matricula**: Número de matrícula profesional (TEXT, UNIQUE)
- **nombre**: Nombre del médico (TEXT, NOT NULL)
- **apellido**: Apellido del médico (TEXT, NOT NULL)
- **especialidad**: Especialidad médica (TEXT, NOT NULL)
- **email**: Correo electrónico (TEXT, UNIQUE, NOT NULL)
- **telefono**: Número de teléfono (TEXT, NOT NULL)
- **fechaNacimiento**: Fecha de nacimiento (TIMESTAMP, NOT NULL)
- **direccion**: Dirección del médico (TEXT, OPTIONAL)
- **activo**: Estado activo/inactivo (BOOLEAN, DEFAULT: true)
- **createdAt**: Fecha de creación (TIMESTAMP, DEFAULT: now())
- **updatedAt**: Fecha de última actualización (TIMESTAMP, DEFAULT: now())

### Tabla: `disponibilidades`
- **id**: Identificador único de la disponibilidad (SERIAL, PRIMARY KEY)
- **medicoId**: ID del médico (INTEGER, FOREIGN KEY)
- **diaSemana**: Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
- **horaInicio**: Hora de inicio del horario (TEXT, formato HH:MM)
- **horaFin**: Hora de fin del horario (TEXT, formato HH:MM)
- **activo**: Estado activo/inactivo (BOOLEAN, DEFAULT: true)
- **createdAt**: Fecha de creación (TIMESTAMP, DEFAULT: now())
- **updatedAt**: Fecha de última actualización (TIMESTAMP, DEFAULT: now())

## Comandos de Migración

### Generar una nueva migración
```bash
npm run prisma:migrate
```

### Aplicar migraciones en producción
```bash
npm run prisma:deploy
```

### Revertir migraciones
```bash
npx prisma migrate reset
```

### Ver estado de migraciones
```bash
npx prisma migrate status
```

## Relaciones

- **medicos** ↔ **disponibilidades**: Un médico puede tener múltiples disponibilidades (1:N)
- **disponibilidades** → **medicos**: Cada disponibilidad pertenece a un médico específico (N:1)

## Índices

- **medicos.matricula**: Índice único para búsquedas por matrícula
- **medicos.email**: Índice único para búsquedas por email
- **disponibilidades.medicoId**: Índice para búsquedas por médico
- **disponibilidades.diaSemana**: Índice para búsquedas por día de la semana

## Notas Importantes

1. **Soft Delete**: Los médicos y disponibilidades se marcan como inactivos en lugar de eliminarse físicamente
2. **Cascade Delete**: Al eliminar un médico, sus disponibilidades se marcan como inactivas automáticamente
3. **Validaciones**: Las validaciones de datos se realizan a nivel de aplicación usando Joi
4. **Formato de Hora**: Las horas se almacenan en formato HH:MM (24 horas)
5. **Días de la Semana**: Se usan números del 0 al 6 (0=Domingo, 1=Lunes, etc.)
