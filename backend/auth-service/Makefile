# Makefile for auth-service

.PHONY: build run test clean docker-build docker-run docker-compose-up docker-compose-down migrate-up migrate-down swagger

# Go related variables
GO=go
GOBUILD=$(GO) build
GOTEST=$(GO) test
GOCLEAN=$(GO) clean
GOFMT=$(GO) fmt
GOLINT=golangci-lint
GOVET=$(GO) vet
SWAG=swag
BINARY_NAME=auth-service
BINARY_UNIX=$(BINARY_NAME)_unix

# Build the application
build:
	$(GOBUILD) -o $(BINARY_NAME) -v ./cmd/api

# Run the application
run:
	$(GO) run ./cmd/api

# Test the application
test:
	$(GOTEST) -v ./...

# Clean the binary
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)
	rm -f $(BINARY_UNIX)

# Format the code
fmt:
	$(GOFMT) ./...

# Lint the code
lint:
	$(GOLINT) run

# Vet the code
vet:
	$(GOVET) ./...

# Build for production
prod-build:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(BINARY_UNIX) -v ./cmd/api

# Build Docker image
docker-build:
	docker build -t auth-service .

# Run Docker container
docker-run:
	docker run -p 8080:8080 --name auth-service auth-service

# Start Docker Compose services
docker-compose-up:
	docker-compose up -d

# Stop Docker Compose services
docker-compose-down:
	docker-compose down

# Create .env file from example if it doesn't exist
env:
	if [ ! -f .env ]; then cp .env.example .env; fi

# Install dependencies
deps:
	$(GO) mod download

# Update dependencies
deps-update:
	$(GO) get -u ./...
	$(GO) mod tidy

# Run database migrations up
migrate-up:
	migrate -path migrations -database "mysql://$(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):$(DB_PORT))/$(DB_NAME)" up

# Run database migrations down
migrate-down:
	migrate -path migrations -database "mysql://$(DB_USER):$(DB_PASSWORD)@tcp($(DB_HOST):$(DB_PORT))/$(DB_NAME)" down

# Generate Swagger documentation
swagger:
	$(SWAG) init -g cmd/api/main.go -o docs

# Help command
help:
	@echo "Available commands:"
	@echo "  make build            - Build the application"
	@echo "  make run              - Run the application"
	@echo "  make test             - Run tests"
	@echo "  make clean            - Clean build files"
	@echo "  make fmt              - Format code"
	@echo "  make lint             - Lint code"
	@echo "  make vet              - Vet code"
	@echo "  make prod-build       - Build for production (Linux)"
	@echo "  make docker-build     - Build Docker image"
	@echo "  make docker-run       - Run Docker container"
	@echo "  make docker-compose-up - Start all services with Docker Compose"
	@echo "  make docker-compose-down - Stop all services"
	@echo "  make env              - Create .env file from example"
	@echo "  make deps             - Install dependencies"
	@echo "  make deps-update      - Update dependencies"
	@echo "  make migrate-up       - Run database migrations up"
	@echo "  make migrate-down     - Run database migrations down"

# Default target
.DEFAULT_GOAL := help