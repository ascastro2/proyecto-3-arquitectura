# Migración Inicial - Base de Datos de Pacientes

Esta migración crea la tabla inicial `pacientes` con la siguiente estructura:

## Campos de la Tabla

- `id`: Identificador único autoincremental
- `dni`: Número de documento único (8 dígitos)
- `nombre`: Nombre del paciente
- `apellido`: Apellido del paciente
- `email`: Email único del paciente
- `telefono`: Número de teléfono (10 dígitos)
- `fechaNacimiento`: Fecha de nacimiento
- `direccion`: Dirección opcional
- `createdAt`: Timestamp de creación
- `updatedAt`: Timestamp de última actualización

## Índices Únicos

- `dni`: Garantiza que no haya DNIs duplicados
- `email`: Garantiza que no haya emails duplicados

## Comandos de Migración

```bash
# Generar migración
npx prisma migrate dev --name init

# Aplicar migración
npx prisma migrate deploy

# Revertir migración
npx prisma migrate reset
```

## Seed de Datos

Para poblar la base de datos con datos de ejemplo:

```bash
npx prisma db seed
```
