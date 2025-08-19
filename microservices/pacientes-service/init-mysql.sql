-- Script de inicialización para MySQL - Base de datos de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_nacimiento DATETIME NOT NULL,
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_pacientes_dni ON pacientes(dni);
CREATE INDEX idx_pacientes_email ON pacientes(email);
CREATE INDEX idx_pacientes_nombre_apellido ON pacientes(nombre, apellido);

-- Insertar algunos datos de ejemplo
INSERT INTO pacientes (dni, nombre, apellido, email, telefono, fecha_nacimiento, direccion) VALUES
('12345678', 'Juan', 'Pérez', 'juan.perez@email.com', '+54 11 1234-5678', '1985-03-15 00:00:00', 'Av. Corrientes 1234, CABA'),
('87654321', 'María', 'González', 'maria.gonzalez@email.com', '+54 11 8765-4321', '1990-07-22 00:00:00', 'Belgrano 567, CABA'),
('11223344', 'Carlos', 'López', 'carlos.lopez@email.com', '+54 11 1122-3344', '1978-11-08 00:00:00', 'San Martín 890, CABA')
ON DUPLICATE KEY UPDATE dni=dni;
