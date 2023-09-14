FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV PORT = 3030

EXPOSE $PORT

CMD ["npm", "start"]
