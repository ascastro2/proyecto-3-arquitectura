-- Script de inicialización para MySQL - Base de datos de médicos
CREATE TABLE IF NOT EXISTS medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_nacimiento DATETIME NOT NULL,
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disponibilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medico_id INT NOT NULL,
    dia_semana INT NOT NULL, -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    hora_inicio VARCHAR(5) NOT NULL, -- Formato HH:MM
    hora_fin VARCHAR(5) NOT NULL, -- Formato HH:MM
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX idx_medicos_matricula ON medicos(matricula);
CREATE INDEX idx_medicos_email ON medicos(email);
CREATE INDEX idx_medicos_especialidad ON medicos(especialidad);
CREATE INDEX idx_medicos_nombre_apellido ON medicos(nombre, apellido);
CREATE INDEX idx_disponibilidades_medico_id ON disponibilidades(medico_id);
CREATE INDEX idx_disponibilidades_dia_semana ON disponibilidades(dia_semana);

-- Insertar algunos médicos de ejemplo
INSERT INTO medicos (matricula, nombre, apellido, especialidad, email, telefono, fecha_nacimiento, direccion) VALUES
('M001', 'Dr. Carlos', 'Rodríguez', 'Cardiología', 'carlos.rodriguez@email.com', '+54 11 1111-1111', '1975-05-15 00:00:00', 'Av. Santa Fe 1234, CABA'),
('M002', 'Dra. Ana', 'Martínez', 'Dermatología', 'ana.martinez@email.com', '+54 11 2222-2222', '1980-08-22 00:00:00', 'Belgrano 567, CABA'),
('M003', 'Dr. Luis', 'Fernández', 'Ortopedia', 'luis.fernandez@email.com', '+54 11 3333-3333', '1978-12-10 00:00:00', 'San Martín 890, CABA')
ON DUPLICATE KEY UPDATE matricula=matricula;

-- Insertar disponibilidades de ejemplo
INSERT INTO disponibilidades (medico_id, dia_semana, hora_inicio, hora_fin) VALUES
(1, 1, '09:00', '17:00'), -- Dr. Rodríguez - Lunes
(1, 2, '09:00', '17:00'), -- Dr. Rodríguez - Martes
(1, 3, '09:00', '17:00'), -- Dr. Rodríguez - Miércoles
(2, 1, '08:00', '16:00'), -- Dra. Martínez - Lunes
(2, 2, '08:00', '16:00'), -- Dra. Martínez - Martes
(2, 4, '08:00', '16:00'), -- Dra. Martínez - Jueves
(3, 2, '10:00', '18:00'), -- Dr. Fernández - Martes
(3, 3, '10:00', '18:00'), -- Dr. Fernández - Miércoles
(3, 5, '10:00', '18:00')  -- Dr. Fernández - Viernes
ON DUPLICATE KEY UPDATE medico_id=medico_id;
