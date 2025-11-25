FROM golang:1.23-alpine

WORKDIR /app

RUN apk update && apk upgrade && apk add --no-cache git

COPY . .

RUN go mod tidy

CMD ["go", "run", "cmd/main.go"]