#!/bin/sh
set -e

echo "🚀 Iniciando Médicos Service..."

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 15

# Iniciar servicio
echo "🚀 Iniciando servidor Node.js..."
node src/server.js
