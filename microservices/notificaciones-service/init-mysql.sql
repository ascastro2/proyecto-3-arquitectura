-- Script de inicialización para MySQL - Base de datos de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('TURNO_CREADO', 'TURNO_CONFIRMADO', 'TURNO_CANCELADO', 'TURNO_MODIFICADO', 'RECORDATORIO', 'URGENTE') NOT NULL,
    destinatario VARCHAR(255) NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    canal ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    estado ENUM('PENDIENTE', 'ENVIANDO', 'ENVIADO', 'ENTREGADO', 'FALLIDO', 'CANCELADO') DEFAULT 'PENDIENTE',
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NULL,
    intentos INT DEFAULT 0,
    error_mensaje TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX idx_notificaciones_destinatario ON notificaciones(destinatario);
CREATE INDEX idx_notificaciones_canal ON notificaciones(canal);
CREATE INDEX idx_notificaciones_estado ON notificaciones(estado);
CREATE INDEX idx_notificaciones_fecha_envio ON notificaciones(fecha_envio);
CREATE INDEX idx_notificaciones_estado_intentos ON notificaciones(estado, intentos);

-- Crear tabla de plantillas
CREATE TABLE IF NOT EXISTS plantillas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    tipo ENUM('TURNO_CREADO', 'TURNO_CONFIRMADO', 'TURNO_CANCELADO', 'TURNO_MODIFICADO', 'RECORDATORIO', 'URGENTE') NOT NULL,
    canal ENUM('EMAIL', 'SMS', 'PUSH') NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índices para plantillas
CREATE INDEX idx_plantillas_nombre ON plantillas(nombre);
CREATE INDEX idx_plantillas_tipo ON plantillas(tipo);
CREATE INDEX idx_plantillas_canal ON plantillas(canal);
CREATE INDEX idx_plantillas_activa ON plantillas(activa);

-- Insertar algunas notificaciones de ejemplo
INSERT INTO notificaciones (tipo, destinatario, asunto, contenido, canal, estado) VALUES
('TURNO_CREADO', 'juan.perez@email.com', 'Turno Confirmado', 'Su turno para el Dr. Rodríguez ha sido confirmado para el 20/01/2025 a las 09:00', 'EMAIL', 'ENVIADO'),
('RECORDATORIO', '+54 11 1234-5678', 'Recordatorio de Turno', 'Recuerde su turno mañana a las 09:00 con el Dr. Rodríguez', 'SMS', 'ENVIADO'),
('TURNO_MODIFICADO', 'maria.gonzalez@email.com', 'Turno Modificado', 'Su turno ha sido modificado para el 22/01/2025 a las 10:00', 'EMAIL', 'PENDIENTE'),
('TURNO_CANCELADO', '+54 11 8765-4321', 'Turno Cancelado', 'Su turno del 21/01/2025 ha sido cancelado', 'SMS', 'PENDIENTE')
ON DUPLICATE KEY UPDATE destinatario=destinatario;

-- Insertar algunas plantillas de ejemplo
INSERT INTO plantillas (nombre, tipo, canal, asunto, contenido, activa) VALUES
('Turno Confirmado Email', 'TURNO_CONFIRMADO', 'EMAIL', 'Turno Confirmado', 'Su turno para el Dr. {medico} ha sido confirmado para el {fecha} a las {hora}', true),
('Turno Confirmado SMS', 'TURNO_CONFIRMADO', 'SMS', 'Turno Confirmado', 'Su turno para el Dr. {medico} ha sido confirmado para el {fecha} a las {hora}', true),
('Recordatorio Email', 'RECORDATORIO', 'EMAIL', 'Recordatorio de Turno', 'Recuerde su turno mañana a las {hora} con el Dr. {medico}', true),
('Recordatorio SMS', 'RECORDATORIO', 'SMS', 'Recordatorio de Turno', 'Recuerde su turno mañana a las {hora} con el Dr. {medico}', true)
ON DUPLICATE KEY UPDATE nombre=nombre;
