package main

// @title Auth Service API
// @version 1.0
// @description Authentication and Authorization Service API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.example.com/support
// @contact.email support@example.com

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/auth-service/config"
	"github.com/auth-service/docs"
	"github.com/auth-service/internal/handler"
	"github.com/auth-service/internal/middleware"
	"github.com/auth-service/internal/model"
	"github.com/auth-service/internal/repository"
	"github.com/auth-service/internal/service"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	// Load .env file jika ada
	_ = godotenv.Load()

	// Load konfigurasi
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Setup logger
	setupLogger(cfg.Logging)

	// Setup mode Gin
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Inisialisasi koneksi database
	db, err := setupDatabase(cfg.Database)
	if err != nil {
		logrus.Fatalf("Failed to connect to database: %v", err)
	}

	// Inisialisasi koneksi Redis
	redisClient, err := setupRedis(cfg.Redis)
	if err != nil {
		logrus.Fatalf("Failed to connect to Redis: %v", err)
	}

	// Inisialisasi repository
	userRepo := repository.NewMySQLUserRepository(db)
	tokenRepo := repository.NewRedisTokenRepository(redisClient)
	roleRepo := repository.NewRoleRepository(db)
	permissionRepo := repository.NewPermissionRepository(db)

	// Inisialisasi service
	authService := service.NewAuthService(userRepo, tokenRepo, cfg)
	roleService := service.NewRoleService(roleRepo, permissionRepo, userRepo)

	// Inisialisasi default roles dan permissions
	ctx := context.Background()
	if err := roleService.InitializeDefaultRolesAndPermissions(ctx); err != nil {
		logrus.Warnf("Failed to initialize default roles and permissions: %v", err)
	}

	// Inisialisasi handler
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(authService)
	roleHandler := handler.NewRoleHandler(authService, roleService)

	// Inisialisasi middleware
	authMiddleware := middleware.AuthMiddleware(authService)

	// Setup router
	router := setupRouter(cfg)

	// Daftarkan rute
	authHandler.RegisterRoutes(router, authMiddleware)
	userHandler.RegisterRoutes(router, authMiddleware)
	roleHandler.RegisterRoutes(router, authMiddleware)

	// Jalankan server
	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.Server.Port),
		Handler: router,
	}

	// Jalankan server dalam goroutine terpisah
	go func() {
		logrus.Infof("Server running on port %s", cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Tunggu sinyal untuk shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logrus.Info("Shutting down server...")

	// Berikan waktu untuk menyelesaikan request yang sedang berjalan
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Shutdown server
	if err := server.Shutdown(ctx); err != nil {
		logrus.Fatalf("Server forced to shutdown: %v", err)
	}

	logrus.Info("Server exiting")
}

// setupLogger mengatur konfigurasi logger
func setupLogger(cfg config.LoggingConfig) {
	// Set log level
	level, err := logrus.ParseLevel(cfg.Level)
	if err != nil {
		level = logrus.InfoLevel
	}
	logrus.SetLevel(level)

	// Set log format
	if cfg.Format == "json" {
		logrus.SetFormatter(&logrus.JSONFormatter{})
	} else {
		logrus.SetFormatter(&logrus.TextFormatter{FullTimestamp: true})
	}
}

// setupDatabase menginisialisasi koneksi database
func setupDatabase(cfg config.DatabaseConfig) (*gorm.DB, error) {
	// Konfigurasi logger GORM
	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Silent,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Buka koneksi database
	db, err := gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, err
	}

	// Konfigurasi connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	// Auto migrate models
	err = db.AutoMigrate(
		&model.User{},
		&model.Role{},
		&model.Permission{},
		&model.LoginHistory{},
		&model.UserActivity{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %v", err)
	}

	return db, nil
}

// setupRedis menginisialisasi koneksi Redis
func setupRedis(cfg config.RedisConfig) (*redis.Client, error) {
	// Buat klien Redis
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.GetRedisAddr(),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	// Tes koneksi
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, err
	}

	return client, nil
}

// setupRouter mengatur router Gin
func setupRouter(cfg *config.Config) *gin.Engine {
	router := gin.New()

	// Middleware
	router.Use(gin.Recovery())
	router.Use(gin.Logger())

	// CORS configuration
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		MaxAge:           12 * time.Hour,
	}

	// Handle wildcard origins properly
	if len(cfg.Server.CorsAllowOrigins) == 1 && cfg.Server.CorsAllowOrigins[0] == "*" {
		corsConfig.AllowAllOrigins = true
	} else {
		corsConfig.AllowOrigins = cfg.Server.CorsAllowOrigins
		corsConfig.AllowCredentials = true
	}

	router.Use(cors.New(corsConfig))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		response := model.Success200(map[string]string{"status": "ok"}, "Service is healthy")
		c.JSON(http.StatusOK, response)
	})

	// Setup Swagger
	if cfg.Server.SwaggerEnabled {
		// Konfigurasi Swagger info
		docs.SwaggerInfo.Title = "Auth Service API"
		docs.SwaggerInfo.Description = "Authentication and Authorization Service API"
		docs.SwaggerInfo.Version = "1.0"
		docs.SwaggerInfo.Host = fmt.Sprintf("localhost:%s", cfg.Server.Port)
		docs.SwaggerInfo.BasePath = "/api/v1"
		docs.SwaggerInfo.Schemes = []string{"http", "https"}

		// Endpoint Swagger
		router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		logrus.Info("Swagger documentation enabled at /swagger/index.html")
	} else {
		logrus.Info("Swagger documentation disabled")
	}

	return router
}
