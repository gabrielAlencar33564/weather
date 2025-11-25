FROM golang:1.23-alpine

WORKDIR /app

RUN apk update && apk upgrade && \
    apk add --no-cache git

CMD ["tail", "-f", "/dev/null"]