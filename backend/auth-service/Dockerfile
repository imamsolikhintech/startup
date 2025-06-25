# Build stage
FROM golang:1.21-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache git ca-certificates tzdata && \
    update-ca-certificates

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o auth-service ./cmd/api

# Final stage
FROM alpine:latest

# Set working directory
WORKDIR /app

# Install necessary runtime dependencies
RUN apk --no-cache add ca-certificates tzdata && \
    update-ca-certificates

# Copy the binary from builder
COPY --from=builder /app/auth-service .

# Copy configuration files
COPY --from=builder /app/.env* ./

# Expose the application port
EXPOSE 8080

# Set the entry point
ENTRYPOINT ["/app/auth-service"]