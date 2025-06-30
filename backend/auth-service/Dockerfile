# Build stage
# syntax=docker/dockerfile:1.4

# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./ 
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application
RUN go build -o /auth-service ./cmd/api

# Run Stage
FROM alpine:latest

WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /auth-service .

# Expose the application port
EXPOSE 8080

# Set the entry point
ENTRYPOINT ["/app/auth-service"]