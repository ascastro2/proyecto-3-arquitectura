# 🚀 **INSTRUCCIONES PARA EL FLUJO COMPLETO DEL SISTEMA**

## 📋 **Descripción General**

Esta colección de Postman demuestra **paso a paso** todo el sistema de microservicios funcionando correctamente. Es la prueba definitiva de que todos los componentes están integrados y funcionando.

## 🎯 **Objetivo**

Verificar que el sistema completo funcione correctamente, incluyendo:
- ✅ Todos los microservicios funcionando
- ✅ API Gateway (Kong) redirigiendo correctamente
- ✅ Eventos RabbitMQ generándose
- ✅ Notificaciones automáticas
- ✅ Historial de cambios
- ✅ Validaciones y manejo de errores

## 📥 **Importar la Colección**

1. **Abrir Postman**
2. **File → Import**
3. **Seleccionar** `flujo_completo_collection.json`
4. **Importar** la colección

## 🔧 **Configuración Inicial**

### **Variables de Entorno**
La colección incluye variables automáticas que se configuran durante la ejecución:

- `base_url`: `http://localhost:8000` (API Gateway)
- `paciente_id`: Se configura automáticamente al crear el primer paciente
- `medico_id`: Se configura automáticamente al crear el primer médico
- `turno_id`: Se configura automáticamente al crear el primer turno
- `turno_modificado_id`: Se configura automáticamente al crear el segundo turno

### **Verificar Sistema Funcionando**
Antes de ejecutar la colección, asegúrate de que:
```bash
docker-compose ps
```
Todos los servicios deben estar en estado "Up".

## 🚀 **Ejecutar el Flujo Completo**

### **Opción 1: Ejecución Manual (Recomendada para pruebas)**
Ejecutar cada request **en orden secuencial**:

1. **0. Verificación del Sistema** - Health checks de todos los servicios
2. **1. Creación de Pacientes** - Crear 2 pacientes de prueba
3. **2. Creación de Médicos** - Crear 2 médicos de prueba
4. **3. Creación de Turnos** - Crear 2 turnos de prueba
5. **4. Confirmación de Turnos** - Confirmar turnos (genera eventos RabbitMQ)
6. **5. Modificación de Turnos** - Modificar un turno
7. **6. Cancelación de Turnos** - Cancelar un turno
8. **7. Verificación de Eventos** - Verificar notificaciones e historial
9. **8. Consultas y Búsquedas** - Probar funcionalidades de búsqueda
10. **9. Verificación Final** - Estado final del sistema

### **Opción 2: Ejecución Automática**
1. **Seleccionar** la carpeta "🔄 FLUJO COMPLETO DEL SISTEMA"
2. **Click derecho** → "Run collection"
3. **Configurar**:
   - Delay: 1000ms (1 segundo entre requests)
   - Log responses: ✅ Activado
   - Save responses: ✅ Activado
4. **Ejecutar** la colección completa

## 📊 **Qué Verificar en Cada Paso**

### **0. Verificación del Sistema**
- ✅ Todos los health checks devuelven `200 OK`
- ✅ Mensajes de éxito en la consola de Postman
- ✅ API Gateway funcionando correctamente

### **1. Creación de Pacientes**
- ✅ Paciente 1 creado con `201 Created`
- ✅ Variable `paciente_id` configurada automáticamente
- ✅ Paciente 2 creado exitosamente
- ✅ Lista de pacientes muestra 2+ pacientes

### **2. Creación de Médicos**
- ✅ Médico 1 creado con `201 Created`
- ✅ Variable `medico_id` configurada automáticamente
- ✅ Médico 2 creado exitosamente
- ✅ Lista de médicos muestra 2+ médicos

### **3. Creación de Turnos**
- ✅ Turno 1 creado con `201 Created`
- ✅ Variable `turno_id` configurada automáticamente
- ✅ Turno 2 creado exitosamente
- ✅ Lista de turnos muestra 2+ turnos

### **4. Confirmación de Turnos**
- ✅ Turno 1 confirmado con `200 OK`
- ✅ Turno 2 confirmado con `200 OK`
- ✅ Estado de ambos turnos cambia a `CONFIRMADO`
- ✅ **Eventos RabbitMQ generados** (verificar logs del servicio)

### **5. Modificación de Turnos**
- ✅ Turno 2 modificado con `200 OK`
- ✅ Hora cambiada de `14:00` a `16:00`
- ✅ Motivo y observaciones actualizados
- ✅ **Evento RabbitMQ generado** para modificación

### **6. Cancelación de Turnos**
- ✅ Turno 1 cancelado con `200 OK`
- ✅ Estado cambia a `CANCELADO`
- ✅ Motivo de cancelación registrado
- ✅ **Evento RabbitMQ generado** para cancelación

### **7. Verificación de Eventos**
- ✅ Notificaciones obtenidas con `200 OK`
- ✅ Múltiples notificaciones generadas automáticamente
- ✅ Historial de cambios obtenido con `200 OK`
- ✅ Diferentes tipos de cambios registrados

### **8. Consultas y Búsquedas**
- ✅ Paciente encontrado por DNI
- ✅ Médicos filtrados por especialidad
- ✅ Disponibilidad del médico calculada
- ✅ Horarios disponibles mostrados

### **9. Verificación Final**
- ✅ Estado final de todos los servicios verificado
- ✅ Resumen completo del sistema mostrado
- ✅ **Mensaje final**: "¡SISTEMA COMPLETAMENTE FUNCIONAL!"

## 🔍 **Logs y Monitoreo**

### **Consola de Postman**
- ✅ Mensajes de éxito para cada operación
- ✅ IDs generados automáticamente
- ✅ Resumen final del sistema

### **Logs de Docker**
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f agendamiento-service
docker-compose logs -f notificaciones-service
```

### **RabbitMQ Management**
- **URL**: `http://localhost:15672`
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Verificar**: Exchange `eventos.citas` y colas con mensajes

## 🚨 **Posibles Errores y Soluciones**

### **Error: "Connection refused"**
```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Reiniciar servicios si es necesario
docker-compose restart
```

### **Error: "Variable not found"**
- Ejecutar las requests en **orden secuencial**
- Verificar que las variables se configuren automáticamente
- Revisar los tests de Postman en la consola

### **Error: "Health check failed"**
```bash
# Verificar logs del servicio específico
docker-compose logs -f [nombre-servicio]

# Reconstruir el servicio si es necesario
docker-compose up -d --build [nombre-servicio]
```

## 🎉 **Resultado Esperado**

Al finalizar el flujo completo, deberías ver:

```
🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!
📋 Resumen del flujo:
   • Pacientes creados y verificados
   • Médicos creados y verificados
   • Turnos creados, confirmados, modificados y cancelados
   • Eventos RabbitMQ generados correctamente
   • Notificaciones creadas automáticamente
   • Historial de cambios registrado
   • API Gateway funcionando correctamente
```

## 📞 **Siguiente Paso**

Una vez que hayas verificado que **TODOS** los pasos del flujo funcionan correctamente, estaremos listos para:

1. **Generar el prompt completo** del proyecto
2. **Implementar el frontend** (React + Material-UI)
3. **Configurar notificaciones reales** (SMTP + Twilio)
4. **Documentar la implementación** para presentación

---

**⚠️ IMPORTANTE**: No procedas al siguiente paso hasta que hayas verificado que **TODOS** los requests de la colección funcionen correctamente. Esta es la validación final del sistema.
