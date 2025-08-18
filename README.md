# Sistema de Turnos Médicos - Arquitectura de Microservicios

## Descripción del Proyecto

Sistema prototipo funcional para la automatización de los procesos de negocio de agendamiento, modificación y anulación de turnos médicos en un centro de salud, implementado con arquitectura de microservicios usando Docker.

## Alcance Funcional

- ✅ **Agendamiento** de turnos médicos
- ✅ **Modificación** de turnos existentes
- ✅ **Anulación** de turnos existentes
- ✅ **Consulta** de turnos y su estado

## Arquitectura del Sistema

### Componentes Principales

1. **API Gateway (Kong)**: Punto de entrada único para todas las APIs
2. **Message Broker (RabbitMQ)**: Comunicación asíncrona entre microservicios
3. **Microservicios**:
   - **Pacientes Service**: Gestión de pacientes
   - **Médicos Service**: Gestión de médicos y disponibilidad
   - **Agendamiento Service**: Lógica de negocio de turnos
   - **Notificaciones Service**: Sistema de notificaciones
4. **Frontend**: Portal web para usuarios

### Estructura de Carpetas

```
proyecto-3-arquitectura/
├── docker-compose.yml          # Orquestación de contenedores
├── config.env                  # Variables de entorno
├── README.md                   # Documentación del proyecto
├── docs/                       # Documentación técnica
├── infrastructure/             # Configuración de infraestructura
│   ├── api-gateway/           # Configuración de Kong
│   ├── message-broker/        # Configuración de RabbitMQ
│   └── databases/             # Scripts de base de datos
├── microservices/             # Microservicios del sistema
│   ├── pacientes-service/     # Servicio de pacientes
│   ├── medicos-service/       # Servicio de médicos
│   ├── agendamiento-service/  # Servicio de agendamiento
│   └── notificaciones-service/ # Servicio de notificaciones
├── frontend/                  # Aplicación web
│   └── portal-web/           # Portal de turnos médicos
└── shared/                    # Código compartido
    ├── models/               # Modelos de datos
    └── utils/                # Utilidades comunes
```

## Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**: Framework para microservicios
- **PostgreSQL**: Base de datos relacional
- **Prisma**: ORM para Node.js
- **Joi/Zod**: Validación de esquemas

### Infraestructura
- **Docker** + **Docker Compose**: Contenedores y orquestación
- **Kong**: API Gateway
- **RabbitMQ**: Message Broker

### Frontend
- **React** + **TypeScript**: Framework de interfaz
- **Material-UI**: Componentes de interfaz
- **Axios**: Cliente HTTP

## Requisitos del Sistema

- Docker Desktop
- Docker Compose
- Node.js 18+ (para desarrollo local)
- Git

## Instalación y Despliegue

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd proyecto-3-arquitectura
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de configuración
cp config.env .env

# Editar variables según tu entorno
nano .env
```

### 3. Levantar la Infraestructura
```bash
# Construir y levantar todos los servicios
docker-compose up --build

# O en modo detached
docker-compose up -d --build
```

### 4. Verificar Servicios
```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs pacientes-service
```

## Puertos de Acceso

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Kong Admin**: http://localhost:8001
- **RabbitMQ Management**: http://localhost:15672
- **Pacientes Service**: http://localhost:3001
- **Médicos Service**: http://localhost:3002
- **Agendamiento Service**: http://localhost:3003
- **Notificaciones Service**: http://localhost:3004

## Estructura de Microservicios

Cada microservicio implementa la arquitectura de 3 capas:

1. **Controlador (Controllers)**: Manejo de requests HTTP
2. **Servicios (Services)**: Lógica de negocio
3. **Repositorios (Repositories)**: Acceso a datos

## Flujos de Negocio

### Agendamiento de Turnos
1. Cliente solicita turno → Frontend
2. Frontend → API Gateway → Agendamiento Service
3. Agendamiento Service valida disponibilidad → Médicos Service
4. Se crea el turno y se publica evento → RabbitMQ
5. Notificaciones Service consume evento y envía notificación

### Modificación de Turnos
1. Cliente modifica turno → Frontend
2. Se valida disponibilidad del nuevo horario
3. Se actualiza el turno
4. Se publica evento de modificación

### Anulación de Turnos
1. Cliente cancela turno → Frontend
2. Se marca turno como cancelado
3. Se libera la disponibilidad
4. Se publica evento de cancelación

## Desarrollo Local

### Ejecutar un Microservicio Individualmente
```bash
cd microservices/pacientes-service
npm install
npm run dev
```

### Ejecutar Frontend Individualmente
```bash
cd frontend/portal-web
npm install
npm start
```

## Testing

```bash
# Ejecutar tests de todos los microservicios
docker-compose exec pacientes-service npm test
docker-compose exec medicos-service npm test
docker-compose exec agendamiento-service npm test
docker-compose exec notificaciones-service npm test
```

## Monitoreo y Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f agendamiento-service

# Ver logs de RabbitMQ
docker-compose logs -f rabbitmq
```

## Troubleshooting

### Problemas Comunes

1. **Puertos en uso**: Verificar que los puertos no estén ocupados
2. **Bases de datos no conectan**: Verificar que PostgreSQL esté corriendo
3. **RabbitMQ no responde**: Verificar credenciales y conectividad

### Comandos de Diagnóstico
```bash
# Verificar estado de contenedores
docker-compose ps

# Ver logs de errores
docker-compose logs --tail=100

# Reiniciar un servicio específico
docker-compose restart agendamiento-service

# Reconstruir un servicio
docker-compose up --build agendamiento-service
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.
