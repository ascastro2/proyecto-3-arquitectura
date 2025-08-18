FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Dar permisos de ejecución al script de inicio
RUN chmod +x ./start.sh

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["sh", "-c", "./start.sh"]
