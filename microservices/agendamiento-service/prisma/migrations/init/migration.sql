-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TipoCambio" AS ENUM ('CREACION', 'MODIFICACION', 'CANCELACION', 'CONFIRMACION', 'COMPLETADO', 'NO_SHOW');

-- CreateTable
CREATE TABLE "turnos" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "medicoId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora" TIME NOT NULL,
    "duracion" INTEGER NOT NULL DEFAULT 30,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "motivo" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_cambios" (
    "id" SERIAL NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "tipo" "TipoCambio" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "datosAnteriores" JSONB,
    "datosNuevos" JSONB,
    "usuarioId" INTEGER,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_cambios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "turnos_fecha_hora_medicoId_key" ON "turnos"("fecha", "hora", "medicoId");

-- CreateIndex
CREATE INDEX "turnos_pacienteId_idx" ON "turnos"("pacienteId");

-- CreateIndex
CREATE INDEX "turnos_medicoId_idx" ON "turnos"("medicoId");

-- CreateIndex
CREATE INDEX "turnos_fecha_idx" ON "turnos"("fecha");

-- CreateIndex
CREATE INDEX "turnos_estado_idx" ON "turnos"("estado");

-- CreateIndex
CREATE INDEX "historial_cambios_turnoId_idx" ON "historial_cambios"("turnoId");

-- CreateIndex
CREATE INDEX "historial_cambios_tipo_idx" ON "historial_cambios"("tipo");

-- CreateIndex
CREATE INDEX "historial_cambios_fechaCambio_idx" ON "historial_cambios"("fechaCambio");

-- AddForeignKey
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
