FROM node:20-alpine

WORKDIR /app

RUN apk update && apk upgrade

RUN npm i -g @nestjs/cli

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]