FROM node:20-alpine

WORKDIR /app

RUN apk update && apk upgrade

RUN npm i -g @nestjs/cli

CMD ["tail", "-f", "/dev/null"]