FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Dar permisos de ejecución al script de inicio
RUN chmod +x ./start.sh

# Exponer puerto
EXPOSE 3003

# Comando de inicio
CMD ["sh", "-c", "./start.sh"]
