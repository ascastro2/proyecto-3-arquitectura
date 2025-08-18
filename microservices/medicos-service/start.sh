#!/bin/sh

echo "🚀 Iniciando Microservicio de Médicos..."

echo "📊 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed de la base de datos..."
npx prisma db seed

echo "🚀 Iniciando servidor Node.js..."
npm start
