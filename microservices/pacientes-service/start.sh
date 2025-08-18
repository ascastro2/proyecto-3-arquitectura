#!/bin/sh
set -e

# Generar cliente de Prisma
npx prisma generate

# Aplicar migraciones (idempotente en despliegue)
npx prisma migrate deploy

# Ejecutar seed (opcional; si no está configurado, no falla)
if npx prisma db seed; then
  echo "Seed ejecutado correctamente"
else
  echo "Seed no ejecutado o no configurado; continuando..."
fi

# Iniciar servicio
node src/server.js
