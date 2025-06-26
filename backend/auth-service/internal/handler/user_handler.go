package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/auth-service/internal/model"
	"github.com/auth-service/internal/service"
	"github.com/auth-service/internal/utils"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// UserHandler menangani request user management
type UserHandler struct {
	authService service.AuthService
	validator   *validator.Validate
}

// NewUserHandler membuat instance baru UserHandler
func NewUserHandler(authService service.AuthService) *UserHandler {
	return &UserHandler{
		authService: authService,
		validator:   validator.New(),
	}
}

// GetAllUsers godoc
// @Summary Get all users
// @Description Get all users with pagination and search
// @Tags user-management
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by email or name"
// @Success 200 {object} model.UsersListResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek role admin
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "admin" {
		response := model.Error403("Admin access required")
		c.JSON(http.StatusForbidden, response)
		return
	}

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := strings.TrimSpace(c.Query("search"))

	// Sanitasi input search
	if search != "" {
		search = utils.SanitizeInput(search)
	}

	// Dapatkan daftar user
	usersResponse, err := h.authService.GetAllUsers(c.Request.Context(), page, limit, search)
	if err != nil {
		response := model.PaginatedError500("Failed to get users", page, limit)
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	// Buat response dengan pagination
	response := model.PaginatedSuccess200(usersResponse.Users, "Users retrieved successfully", page, limit, usersResponse.Total)
	c.JSON(http.StatusOK, response)
}

// UpdateUser godoc
// @Summary Update user
// @Description Update user information
// @Tags user-management
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param request body model.UpdateUserRequest true "Update user request"
// @Success 200 {object} model.UserResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek role admin
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "admin" {
		response := model.Error403("Admin access required")
		c.JSON(http.StatusForbidden, response)
		return
	}

	// Parse user ID dari URL
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response := model.Error400("Invalid user ID")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Parse request body
	var req model.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := model.Error400("Invalid request format")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Validasi request
	if err := h.validator.Struct(req); err != nil {
		response := model.Error400(err.Error())
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Sanitasi input
	if req.Name != "" {
		req.Name = utils.SanitizeInput(strings.TrimSpace(req.Name))
	}

	// Update user
	userResponse, err := h.authService.UpdateUser(c.Request.Context(), userID, &req)
	if err != nil {
		switch err {
		case service.ErrUserNotFound:
			response := model.Error404("User not found")
			c.JSON(http.StatusNotFound, response)
		case service.ErrInvalidRole:
			response := model.Error400("Invalid role")
			c.JSON(http.StatusBadRequest, response)
		default:
			response := model.Error500("Failed to update user")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success200(userResponse, "User updated successfully")
	c.JSON(http.StatusOK, response)
}

// GetUserStats godoc
// @Summary Get user statistics
// @Description Get user statistics for admin dashboard
// @Tags user-management
// @Accept json
// @Produce json
// @Success 200 {object} model.UserStats
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /users/stats [get]
func (h *UserHandler) GetUserStats(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek role admin
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "admin" {
		response := model.Error403("Admin access required")
		c.JSON(http.StatusForbidden, response)
		return
	}

	// Dapatkan statistik user
	stats, err := h.authService.GetUserStats(c.Request.Context())
	if err != nil {
		response := model.Error500("Failed to get user statistics")
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	response := model.Success200(stats, "User statistics retrieved successfully")
	c.JSON(http.StatusOK, response)
}

// GetUserActivity godoc
// @Summary Get user activity
// @Description Get user activity for specific user
// @Tags user-management
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param days query int false "Number of days" default(30)
// @Success 200 {array} model.UserActivity
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /users/{id}/activity [get]
func (h *UserHandler) GetUserActivity(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek role admin atau user yang sama
	userRole, exists := c.Get("user_role")
	if !exists {
		response := model.Error401("Unauthorized")
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Parse user ID dari URL
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response := model.Error400("Invalid user ID")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Cek apakah admin atau user yang sama
	currentUserID, _ := c.Get("user_id")
	if userRole != "admin" && currentUserID != userID {
		response := model.Error403("Access denied")
		c.JSON(http.StatusForbidden, response)
		return
	}

	// Parse days parameter
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	if days < 1 || days > 365 {
		days = 30
	}

	// Dapatkan aktivitas user
	activityResponse, err := h.authService.GetUserActivityResponse(c.Request.Context(), userID, days)
	if err != nil {
		switch err {
		case service.ErrUserNotFound:
			response := model.Error404("User not found")
			c.JSON(http.StatusNotFound, response)
		default:
			response := model.Error500("Failed to get user activity")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success200(activityResponse, "User activity retrieved successfully")
	c.JSON(http.StatusOK, response)
}

// RegisterRoutes mendaftarkan rute untuk UserHandler
func (h *UserHandler) RegisterRoutes(router *gin.Engine, authMiddleware gin.HandlerFunc) {
	users := router.Group("/api/v1/users")
	users.Use(authMiddleware) // Semua endpoint memerlukan autentikasi
	{
		users.GET("", h.GetAllUsers)                  // GET /api/v1/users
		users.PUT("/:id", h.UpdateUser)               // PUT /api/v1/users/:id
		users.GET("/stats", h.GetUserStats)           // GET /api/v1/users/stats
		users.GET("/:id/activity", h.GetUserActivity) // GET /api/v1/users/:id/activity
	}
}
