package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config menyimpan semua konfigurasi aplikasi
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Google   GoogleConfig
	Security SecurityConfig
	Logging  LoggingConfig
}

// ServerConfig menyimpan konfigurasi server
type ServerConfig struct {
	Port             string
	Environment      string
	CorsAllowOrigins []string
	SwaggerEnabled   bool
}

// DatabaseConfig menyimpan konfigurasi database MySQL
type DatabaseConfig struct {
	Host            string
	Port            string
	Username        string
	Password        string
	Name            string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifetime time.Duration
}

// RedisConfig menyimpan konfigurasi Redis
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// JWTConfig menyimpan konfigurasi JWT
type JWTConfig struct {
	SecretKey          string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
}

// GoogleConfig menyimpan konfigurasi Google OAuth
type GoogleConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

// SecurityConfig menyimpan konfigurasi keamanan
type SecurityConfig struct {
	RateLimitRequests int
	RateLimitDuration time.Duration
	PasswordMinLength int
	MaxLoginAttempts  int
	LockoutDuration   time.Duration
}

// LoggingConfig menyimpan konfigurasi logging
type LoggingConfig struct {
	Level  string
	Format string
}

// LoadConfig memuat konfigurasi dari file .env
func LoadConfig() (*Config, error) {
	// Coba muat file .env jika ada
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Alternatif menggunakan viper
	viper.AutomaticEnv()

	// Konfigurasi server
	serverPort := getEnv("SERVER_PORT", "8080")
	serverEnv := getEnv("ENVIRONMENT", "development")
	corsAllowOrigins := strings.Split(getEnv("CORS_ALLOW_ORIGINS", "http://localhost:3000"), ",")
	swaggerEnabled, _ := strconv.ParseBool(getEnv("SWAGGER_ENABLED", "true"))

	// Konfigurasi database
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "password")
	dbName := getEnv("DB_NAME", "auth_service")
	dbMaxIdleConns, _ := strconv.Atoi(getEnv("DB_MAX_IDLE_CONNS", "10"))
	dbMaxOpenConns, _ := strconv.Atoi(getEnv("DB_MAX_OPEN_CONNS", "100"))
	dbConnMaxLifetime, _ := time.ParseDuration(getEnv("DB_CONN_MAX_LIFETIME", "1h"))

	// Konfigurasi Redis
	redisHost := getEnv("REDIS_HOST", "localhost")
	redisPort := getEnv("REDIS_PORT", "6379")
	redisPassword := getEnv("REDIS_PASSWORD", "")
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))

	// Konfigurasi JWT
	jwtSecretKey := getEnv("JWT_SECRET_KEY", "your_jwt_secret_key_here")
	jwtAccessTokenExpiry, _ := time.ParseDuration(getEnv("JWT_ACCESS_TOKEN_EXPIRY", "15m"))
	jwtRefreshTokenExpiry, _ := time.ParseDuration(getEnv("JWT_REFRESH_TOKEN_EXPIRY", "7d"))

	// Konfigurasi Google OAuth
	googleClientID := getEnv("GOOGLE_CLIENT_ID", "")
	googleClientSecret := getEnv("GOOGLE_CLIENT_SECRET", "")
	googleRedirectURL := getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/v1/auth/google/callback")

	// Konfigurasi keamanan
	rateLimitRequests, _ := strconv.Atoi(getEnv("RATE_LIMIT_REQUESTS", "100"))
	rateLimitDuration, _ := time.ParseDuration(getEnv("RATE_LIMIT_DURATION", "1m"))
	passwordMinLength, _ := strconv.Atoi(getEnv("PASSWORD_MIN_LENGTH", "8"))
	maxLoginAttempts, _ := strconv.Atoi(getEnv("MAX_LOGIN_ATTEMPTS", "5"))
	lockoutDuration, _ := time.ParseDuration(getEnv("LOCKOUT_DURATION", "15m"))

	// Konfigurasi logging
	logLevel := getEnv("LOG_LEVEL", "info")
	logFormat := getEnv("LOG_FORMAT", "json")

	return &Config{
		Server: ServerConfig{
			Port:             serverPort,
			Environment:      serverEnv,
			CorsAllowOrigins: corsAllowOrigins,
			SwaggerEnabled:   swaggerEnabled,
		},
		Database: DatabaseConfig{
			Host:            dbHost,
			Port:            dbPort,
			Username:        dbUser,
			Password:        dbPassword,
			Name:            dbName,
			MaxIdleConns:    dbMaxIdleConns,
			MaxOpenConns:    dbMaxOpenConns,
			ConnMaxLifetime: dbConnMaxLifetime,
		},
		Redis: RedisConfig{
			Host:     redisHost,
			Port:     redisPort,
			Password: redisPassword,
			DB:       redisDB,
		},
		JWT: JWTConfig{
			SecretKey:          jwtSecretKey,
			AccessTokenExpiry:  jwtAccessTokenExpiry,
			RefreshTokenExpiry: jwtRefreshTokenExpiry,
		},
		Google: GoogleConfig{
			ClientID:     googleClientID,
			ClientSecret: googleClientSecret,
			RedirectURL:  googleRedirectURL,
		},
		Security: SecurityConfig{
			RateLimitRequests: rateLimitRequests,
			RateLimitDuration: rateLimitDuration,
			PasswordMinLength: passwordMinLength,
			MaxLoginAttempts:  maxLoginAttempts,
			LockoutDuration:   lockoutDuration,
		},
		Logging: LoggingConfig{
			Level:  logLevel,
			Format: logFormat,
		},
	}, nil
}

// GetDSN mengembalikan Data Source Name untuk koneksi MySQL
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.Username, c.Password, c.Host, c.Port, c.Name)
}

// GetRedisAddr mengembalikan alamat Redis
func (c *RedisConfig) GetRedisAddr() string {
	return fmt.Sprintf("%s:%s", c.Host, c.Port)
}

// Helper untuk mendapatkan nilai environment variable dengan default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
