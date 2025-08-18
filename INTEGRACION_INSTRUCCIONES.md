# 🚀 Instrucciones de Integración y Pruebas - Sistema de Turnos Médicos

## 📋 Estado Actual del Proyecto

✅ **Microservicios Implementados:**
- `pacientes-service` - Gestión completa de pacientes
- `medicos-service` - Gestión completa de médicos y disponibilidades
- `agendamiento-service` - Gestión completa de turnos y flujos de negocio
- `notificaciones-service` - Sistema de notificaciones por Email y SMS

✅ **Infraestructura Configurada:**
- API Gateway (Kong) con rutas para todos los microservicios
- RabbitMQ como message broker
- Bases de datos PostgreSQL independientes para cada microservicio
- Docker Compose para orquestación completa

✅ **Archivos Críticos Restaurados:**
- Configuración de Kong con volumen para `kong.yml`
- Variables de entorno completas para `notificaciones-service`
- Dependencias correctas entre microservicios

## 🚀 Pasos para la Integración Completa

### 1. Preparación del Entorno

```bash
# Asegúrate de tener Docker y Docker Compose instalados
docker --version
docker-compose --version

# Verifica que los puertos estén disponibles
# - 8000: API Gateway (Kong)
# - 8001: Kong Admin
# - 3001: Pacientes Service
# - 3002: Médicos Service
# - 3003: Agendamiento Service
# - 3004: Notificaciones Service
# - 5432-5435: Bases de datos
# - 5672: RabbitMQ
# - 15672: RabbitMQ Management
```

### 2. Configuración de Variables de Entorno

```bash
# Copia el archivo de configuración
cp config.env .env

# Edita .env con tus credenciales reales para:
# - SMTP (Gmail, Outlook, etc.)
# - Twilio (Account SID, Auth Token, From Number)
```

### 3. Inicio del Sistema

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# O en modo detached (background)
docker-compose up --build -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f pacientes-service
docker-compose logs -f medicos-service
docker-compose logs -f agendamiento-service
docker-compose logs -f notificaciones-service
```

### 4. Verificación de Servicios

```bash
# Verificar que todos los contenedores estén ejecutándose
docker-compose ps

# Verificar logs de inicio
docker-compose logs api-gateway
docker-compose logs pacientes-service
docker-compose logs medicos-service
docker-compose logs agendamiento-service
docker-compose logs notificaciones-service
```

## 🧪 Pruebas con Postman

### 1. Importar Colección

1. Abre Postman
2. Haz clic en "Import"
3. Selecciona el archivo `postman_collection.json`
4. La colección se importará con todas las variables configuradas

### 2. Orden de Pruebas Recomendado

#### **Fase 1: Health Checks**
1. ✅ API Gateway Health
2. ✅ Pacientes Service Health
3. ✅ Médicos Service Health
4. ✅ Agendamiento Service Health
5. ✅ Notificaciones Service Health

#### **Fase 2: Creación de Datos Base**
1. ✅ Crear Paciente
2. ✅ Crear Médico
3. ✅ Crear Disponibilidad del Médico

#### **Fase 3: Flujo de Agendamiento**
1. ✅ Crear Turno
2. ✅ Confirmar Turno
3. ✅ Enviar Notificación de Confirmación

#### **Fase 4: Flujos de Modificación y Cancelación**
1. ✅ Modificar Turno
2. ✅ Enviar Notificación de Modificación
3. ✅ Cancelar Turno
4. ✅ Enviar Notificación de Cancelación

#### **Fase 5: Consultas y Reportes**
1. ✅ Obtener Todos los Turnos
2. ✅ Obtener Historial de Cambios
3. ✅ Obtener Estadísticas
4. ✅ Buscar Disponibilidad

## 🔍 Verificación de Funcionalidad

### Endpoints Disponibles por Microservicio

#### **API Gateway (Puerto 8000)**
- `/api/pacientes/*` → Pacientes Service
- `/api/medicos/*` → Médicos Service
- `/api/agendamiento/*` → Agendamiento Service
- `/api/notificaciones/*` → Notificaciones Service

#### **Pacientes Service (Puerto 3001)**
- `GET /health` - Health check
- `GET /` - Información del servicio
- `POST /pacientes` - Crear paciente
- `GET /pacientes` - Listar pacientes
- `GET /pacientes/:id` - Obtener paciente por ID
- `GET /pacientes/dni/:dni` - Buscar por DNI
- `GET /pacientes/email/:email` - Buscar por email
- `PUT /pacientes/:id` - Actualizar paciente
- `DELETE /pacientes/:id` - Eliminar paciente

#### **Médicos Service (Puerto 3002)**
- `GET /health` - Health check
- `GET /` - Información del servicio
- `POST /medicos` - Crear médico
- `GET /medicos` - Listar médicos
- `GET /medicos/:id` - Obtener médico por ID
- `GET /medicos/matricula/:matricula` - Buscar por matrícula
- `GET /medicos/especialidad/:especialidad` - Buscar por especialidad
- `PUT /medicos/:id` - Actualizar médico
- `DELETE /medicos/:id` - Eliminar médico
- `POST /medicos/disponibilidades` - Crear disponibilidad
- `GET /medicos/:id/disponibilidades` - Obtener disponibilidades

#### **Agendamiento Service (Puerto 3003)**
- `GET /health` - Health check
- `GET /` - Información del servicio
- `POST /turnos` - Crear turno
- `GET /turnos` - Listar turnos
- `GET /turnos/:id` - Obtener turno por ID
- `PUT /turnos/:id` - Modificar turno
- `PATCH /turnos/:id/cancelar` - Cancelar turno
- `PATCH /turnos/:id/confirmar` - Confirmar turno
- `PATCH /turnos/:id/completar` - Completar turno
- `PATCH /turnos/:id/no-show` - Marcar no-show
- `GET /disponibilidad` - Buscar disponibilidad
- `GET /historial` - Obtener historial de cambios
- `GET /estadisticas` - Obtener estadísticas

#### **Notificaciones Service (Puerto 3004)**
- `GET /health` - Health check
- `GET /` - Información del servicio
- `GET /notificaciones` - Listar notificaciones
- `POST /notificaciones` - Crear notificación
- `POST /notificaciones/enviar/confirmacion` - Enviar confirmación
- `POST /notificaciones/enviar/modificacion` - Enviar modificación
- `POST /notificaciones/enviar/cancelacion` - Enviar cancelación
- `POST /notificaciones/enviar/recordatorio` - Enviar recordatorio
- `GET /notificaciones/plantillas` - Listar plantillas
- `POST /notificaciones/plantillas` - Crear plantilla
- `GET /notificaciones/verificar-servicios` - Verificar servicios

## 🚨 Solución de Problemas Comunes

### 1. Error de Conexión a Base de Datos
```bash
# Verificar que las bases de datos estén ejecutándose
docker-compose ps | grep db

# Ver logs de la base de datos
docker-compose logs pacientes-db
docker-compose logs medicos-db
docker-compose logs agendamiento-db
docker-compose logs notificaciones-db
```

### 2. Error de Migración de Prisma
```bash
# Entrar al contenedor del servicio
docker-compose exec pacientes-service sh

# Ejecutar migraciones manualmente
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 3. Error de Kong API Gateway
```bash
# Verificar configuración de Kong
docker-compose logs api-gateway

# Verificar que el archivo kong.yml esté montado
docker-compose exec api-gateway ls -la /usr/local/kong/declarative/
```

### 4. Error de RabbitMQ
```bash
# Verificar estado de RabbitMQ
docker-compose logs rabbitmq

# Acceder a la interfaz web de RabbitMQ
# http://localhost:15672
# Usuario: admin
# Contraseña: admin123
```

### 5. Error de Comunicación entre Microservicios
```bash
# Verificar que todos los servicios estén ejecutándose
docker-compose ps

# Verificar logs de comunicación
docker-compose logs agendamiento-service | grep "Error"
docker-compose logs notificaciones-service | grep "Error"
```

## 📊 Verificación de Integración

### 1. Flujo de Agendamiento Completo
```bash
# 1. Crear paciente
curl -X POST http://localhost:8000/api/pacientes \
  -H "Content-Type: application/json" \
  -d '{"dni":"12345678","nombre":"Juan","apellido":"Pérez","email":"juan@email.com","telefono":"+5491112345678","fechaNacimiento":"1990-05-15","direccion":"Av. Corrientes 1234"}'

# 2. Crear médico
curl -X POST http://localhost:8000/api/medicos \
  -H "Content-Type: application/json" \
  -d '{"matricula":"M12345","nombre":"Dr. Carlos","apellido":"González","especialidad":"Cardiología","email":"carlos@hospital.com","telefono":"+5491112345678","fechaNacimiento":"1975-03-20","direccion":"Av. Santa Fe 567"}'

# 3. Crear turno
curl -X POST http://localhost:8000/api/agendamiento/turnos \
  -H "Content-Type: application/json" \
  -d '{"pacienteId":1,"medicoId":1,"fecha":"2024-02-20","hora":"10:00:00","duracion":30,"motivo":"Consulta de rutina"}'

# 4. Confirmar turno
curl -X PATCH http://localhost:8000/api/agendamiento/turnos/1/confirmar

# 5. Enviar notificación
curl -X POST http://localhost:8000/api/notificaciones/enviar/confirmacion \
  -H "Content-Type: application/json" \
  -d '{"pacienteId":1,"medicoId":1,"turnoId":1,"canal":"EMAIL"}'
```

### 2. Verificación de Estado
```bash
# Verificar pacientes
curl http://localhost:8000/api/pacientes

# Verificar médicos
curl http://localhost:8000/api/medicos

# Verificar turnos
curl http://localhost:8000/api/agendamiento/turnos

# Verificar notificaciones
curl http://localhost:8000/api/notificaciones
```

## 🎯 Criterios de Éxito

✅ **Funcionalidad Básica:**
- Todos los microservicios responden a health checks
- API Gateway enruta correctamente las peticiones
- CRUD completo funciona en todos los servicios

✅ **Integración:**
- Los microservicios se comunican entre sí correctamente
- Las notificaciones se envían por email y SMS
- Los flujos de negocio funcionan end-to-end

✅ **Estabilidad:**
- El sistema maneja errores gracefully
- Las bases de datos se inicializan correctamente
- Los servicios se recuperan de fallos

## 🔄 Próximos Pasos

1. **Frontend Implementation** - React con Material-UI
2. **Testing End-to-End** - Pruebas automatizadas
3. **Monitoring** - Logs y métricas
4. **Documentation** - API docs con Swagger
5. **Deployment** - Configuración de producción

---

**¡El sistema está listo para pruebas de integración! 🚀**

Importa la colección de Postman y sigue el orden de pruebas recomendado para verificar que todo funcione correctamente.
