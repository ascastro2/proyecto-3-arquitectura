-- Script de inicialización para MySQL - Base de datos de agendamiento
CREATE TABLE IF NOT EXISTS turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    fecha DATETIME NOT NULL,
    hora VARCHAR(5) NOT NULL, -- Formato HH:MM
    dia_semana INT NOT NULL, -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    estado ENUM('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_SHOW') DEFAULT 'PENDIENTE',
    motivo TEXT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historial_cambios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turno_id INT NOT NULL,
    tipo_cambio ENUM('CREACION', 'MODIFICACION', 'CANCELACION', 'REAGENDAMIENTO', 'CONFIRMACION') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX idx_turnos_paciente_id ON turnos(paciente_id);
CREATE INDEX idx_turnos_medico_id ON turnos(medico_id);
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_estado ON turnos(estado);
CREATE INDEX idx_turnos_medico_fecha ON turnos(medico_id, fecha);
CREATE INDEX idx_historial_turno_id ON historial_cambios(turno_id);
CREATE INDEX idx_historial_tipo_cambio ON historial_cambios(tipo_cambio);
CREATE INDEX idx_historial_fecha_cambio ON historial_cambios(fecha_cambio);

-- Insertar algunos turnos de ejemplo
INSERT INTO turnos (paciente_id, medico_id, fecha, hora, dia_semana, estado, motivo, observaciones) VALUES
(1, 1, '2025-01-20 09:00:00', '09:00', 1, 'CONFIRMADO', 'Consulta de rutina', 'Paciente con hipertensión'),
(1, 2, '2025-01-22 10:00:00', '10:00', 3, 'PENDIENTE', 'Revisión de tratamiento', 'Control mensual'),
(2, 1, '2025-01-21 14:00:00', '14:00', 2, 'CONFIRMADO', 'Electrocardiograma', 'Paciente con dolor de pecho'),
(3, 3, '2025-01-23 11:00:00', '11:00', 4, 'PENDIENTE', 'Consulta traumatológica', 'Dolor en rodilla derecha')
ON DUPLICATE KEY UPDATE paciente_id=paciente_id;

-- Insertar historial de cambios de ejemplo
INSERT INTO historial_cambios (turno_id, tipo_cambio, descripcion, usuario_id) VALUES
(1, 'CREACION', 'Turno creado por el sistema', 1),
(1, 'CONFIRMACION', 'Turno confirmado por el paciente', 1),
(2, 'CREACION', 'Turno creado por el sistema', 1),
(3, 'CREACION', 'Turno creado por el sistema', 1),
(3, 'CONFIRMACION', 'Turno confirmado por el paciente', 1),
(4, 'CREACION', 'Turno creado por el sistema', 1)
ON DUPLICATE KEY UPDATE turno_id=turno_id;
