FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY . .

RUN chmod +x ./start.sh

EXPOSE 3004

CMD ["sh", "-c", "./start.sh"]
