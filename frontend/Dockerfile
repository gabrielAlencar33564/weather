FROM node:20-alpine AS builder

WORKDIR /app

RUN apk update && apk add --no-cache libc6-compat

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine AS runner

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
