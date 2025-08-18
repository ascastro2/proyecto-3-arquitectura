#!/bin/bash

echo "🚀 Iniciando Agendamiento Service..."

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 5

# Aplicar migraciones de Prisma
echo "📊 Aplicando migraciones de Prisma..."
npx prisma migrate deploy

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Sembrar base de datos
echo "🌱 Sembrando base de datos..."
npx prisma db seed

# Iniciar la aplicación
echo "🚀 Iniciando aplicación..."
npm start
