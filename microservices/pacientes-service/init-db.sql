-- Script de inicialización para la base de datos de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    "fechaNacimiento" TIMESTAMP NOT NULL,
    direccion TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre_apellido ON pacientes(nombre, apellido);

-- Insertar algunos datos de ejemplo
INSERT INTO pacientes (dni, nombre, apellido, email, telefono, "fechaNacimiento", direccion) VALUES
('12345678', 'Juan', 'Pérez', 'juan.perez@email.com', '+54 11 1234-5678', '1985-03-15', 'Av. Corrientes 1234, CABA'),
('87654321', 'María', 'González', 'maria.gonzalez@email.com', '+54 11 8765-4321', '1990-07-22', 'Belgrano 567, CABA'),
('11223344', 'Carlos', 'López', 'carlos.lopez@email.com', '+54 11 1122-3344', '1978-11-08', 'San Martín 890, CABA')
ON CONFLICT (dni) DO NOTHING;
