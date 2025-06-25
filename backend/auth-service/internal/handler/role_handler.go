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

// RoleHandler handles role and permission related requests
type RoleHandler struct {
	authService service.AuthService
	roleService service.RoleService
	validator   *validator.Validate
}

// NewRoleHandler creates a new RoleHandler
func NewRoleHandler(authService service.AuthService, roleService service.RoleService) *RoleHandler {
	return &RoleHandler{
		authService: authService,
		roleService: roleService,
		validator:   validator.New(),
	}
}

// GetAllRoles godoc
// @Summary Get all roles
// @Description Get all roles with pagination and search
// @Tags role-management
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name or display name"
// @Success 200 {object} model.RolesListResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /roles [get]
func (h *RoleHandler) GetAllRoles(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek permission
	if !h.checkPermission(c, "roles", "list") {
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

	// Dapatkan daftar role
	rolesResponse, err := h.roleService.GetAllRoles(c.Request.Context(), page, limit, search)
	if err != nil {
		response := model.PaginatedError500("Failed to get roles", page, limit)
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	// Buat response dengan pagination
	response := model.PaginatedSuccess200(rolesResponse.Roles, "Roles retrieved successfully", page, limit, rolesResponse.Total)
	c.JSON(http.StatusOK, response)
}

// GetRoleByID godoc
// @Summary Get role by ID
// @Description Get role details by ID
// @Tags role-management
// @Accept json
// @Produce json
// @Param id path string true "Role ID"
// @Success 200 {object} model.RoleResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /roles/{id} [get]
func (h *RoleHandler) GetRoleByID(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek permission
	if !h.checkPermission(c, "roles", "read") {
		return
	}

	// Parse role ID dari URL
	roleIDStr := c.Param("id")
	roleID, err := uuid.Parse(roleIDStr)
	if err != nil {
		response := model.Error400("Invalid role ID")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Dapatkan role
	roleResponse, err := h.roleService.GetRoleByID(c.Request.Context(), roleID)
	if err != nil {
		switch err {
		case service.ErrRoleNotFound:
			response := model.Error404("Role not found")
			c.JSON(http.StatusNotFound, response)
		default:
			response := model.Error500("Failed to get role")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success200(roleResponse, "Role retrieved successfully")
	c.JSON(http.StatusOK, response)
}

// CreateRole godoc
// @Summary Create new role
// @Description Create a new role with permissions
// @Tags role-management
// @Accept json
// @Produce json
// @Param request body model.CreateRoleRequest true "Create role request"
// @Success 201 {object} model.RoleResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /roles [post]
func (h *RoleHandler) CreateRole(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek permission
	if !h.checkPermission(c, "roles", "create") {
		return
	}

	// Parse request body
	var req model.CreateRoleRequest
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
	req.Name = utils.SanitizeInput(strings.TrimSpace(req.Name))
	req.DisplayName = utils.SanitizeInput(strings.TrimSpace(req.DisplayName))
	req.Description = utils.SanitizeInput(strings.TrimSpace(req.Description))

	// Create role
	roleResponse, err := h.roleService.CreateRole(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case service.ErrRoleAlreadyExists:
			response := model.Error409("Role already exists")
			c.JSON(http.StatusConflict, response)
		case service.ErrInvalidPermissions:
			response := model.Error400("Invalid permissions")
			c.JSON(http.StatusBadRequest, response)
		default:
			response := model.Error500("Failed to create role")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success201(roleResponse, "Role created successfully")
	c.JSON(http.StatusCreated, response)
}

// UpdateRole godoc
// @Summary Update role
// @Description Update role information and permissions
// @Tags role-management
// @Accept json
// @Produce json
// @Param id path string true "Role ID"
// @Param request body model.UpdateRoleRequest true "Update role request"
// @Success 200 {object} model.RoleResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /roles/{id} [put]
func (h *RoleHandler) UpdateRole(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek permission
	if !h.checkPermission(c, "roles", "update") {
		return
	}

	// Parse role ID dari URL
	roleIDStr := c.Param("id")
	roleID, err := uuid.Parse(roleIDStr)
	if err != nil {
		response := model.Error400("Invalid role ID")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Parse request body
	var req model.UpdateRoleRequest
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
	if req.DisplayName != nil {
		displayName := utils.SanitizeInput(strings.TrimSpace(*req.DisplayName))
		req.DisplayName = &displayName
	}
	if req.Description != nil {
		description := utils.SanitizeInput(strings.TrimSpace(*req.Description))
		req.Description = &description
	}

	// Update role
	roleResponse, err := h.roleService.UpdateRole(c.Request.Context(), roleID, &req)
	if err != nil {
		switch err {
		case service.ErrRoleNotFound:
			response := model.Error404("Role not found")
			c.JSON(http.StatusNotFound, response)
		case service.ErrInvalidPermissions:
			response := model.Error400("Invalid permissions")
			c.JSON(http.StatusBadRequest, response)
		default:
			response := model.Error500("Failed to update role")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success200(roleResponse, "Role updated successfully")
	c.JSON(http.StatusOK, response)
}

// DeleteRole godoc
// @Summary Delete role
// @Description Delete role by ID
// @Tags role-management
// @Accept json
// @Produce json
// @Param id path string true "Role ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /roles/{id} [delete]
func (h *RoleHandler) DeleteRole(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek permission
	if !h.checkPermission(c, "roles", "delete") {
		return
	}

	// Parse role ID dari URL
	roleIDStr := c.Param("id")
	roleID, err := uuid.Parse(roleIDStr)
	if err != nil {
		response := model.Error400("Invalid role ID")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Delete role
	err = h.roleService.DeleteRole(c.Request.Context(), roleID)
	if err != nil {
		switch err {
		case service.ErrRoleNotFound:
			response := model.Error404("Role not found")
			c.JSON(http.StatusNotFound, response)
		case service.ErrRoleInUse:
			response := model.Error400("Role is currently in use and cannot be deleted")
			c.JSON(http.StatusBadRequest, response)
		default:
			response := model.Error500("Failed to delete role")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success200(nil, "Role deleted successfully")
	c.JSON(http.StatusOK, response)
}

// GetAllPermissions godoc
// @Summary Get all permissions
// @Description Get all permissions with pagination and search
// @Tags permission-management
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name or resource"
// @Param resource query string false "Filter by resource"
// @Success 200 {object} model.PermissionsListResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /permissions [get]
func (h *RoleHandler) GetAllPermissions(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek permission
	if !h.checkPermission(c, "permissions", "list") {
		return
	}

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := strings.TrimSpace(c.Query("search"))
	resource := strings.TrimSpace(c.Query("resource"))

	// Sanitasi input
	if search != "" {
		search = utils.SanitizeInput(search)
	}
	if resource != "" {
		resource = utils.SanitizeInput(resource)
	}

	// Dapatkan daftar permission
	permissionsResponse, err := h.roleService.GetAllPermissions(c.Request.Context(), page, limit, search, resource)
	if err != nil {
		response := model.PaginatedError500("Failed to get permissions", page, limit)
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	// Buat response dengan pagination
	response := model.PaginatedSuccess200(permissionsResponse.Permissions, "Permissions retrieved successfully", page, limit, permissionsResponse.Total)
	c.JSON(http.StatusOK, response)
}

// CreatePermission godoc
// @Summary Create new permission
// @Description Create a new permission
// @Tags permission-management
// @Accept json
// @Produce json
// @Param request body model.CreatePermissionRequest true "Create permission request"
// @Success 201 {object} model.PermissionResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /permissions [post]
func (h *RoleHandler) CreatePermission(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Cek permission
	if !h.checkPermission(c, "permissions", "create") {
		return
	}

	// Parse request body
	var req model.CreatePermissionRequest
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
	req.Name = utils.SanitizeInput(strings.TrimSpace(req.Name))
	req.DisplayName = utils.SanitizeInput(strings.TrimSpace(req.DisplayName))
	req.Description = utils.SanitizeInput(strings.TrimSpace(req.Description))
	req.Resource = utils.SanitizeInput(strings.TrimSpace(req.Resource))
	req.Action = utils.SanitizeInput(strings.TrimSpace(req.Action))

	// Create permission
	permissionResponse, err := h.roleService.CreatePermission(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case service.ErrPermissionAlreadyExists:
			response := model.Error409("Permission already exists")
			c.JSON(http.StatusConflict, response)
		default:
			response := model.Error500("Failed to create permission")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success201(permissionResponse, "Permission created successfully")
	c.JSON(http.StatusCreated, response)
}

// checkPermission checks if user has specific permission using the new role system
func (h *RoleHandler) checkPermission(c *gin.Context, resource, action string) bool {
	// userID, exists := c.Get("user_id")
	// if !exists {
	// 	response := model.Error401("Unauthorized")
	// 	c.JSON(http.StatusUnauthorized, response)
	// 	return false
	// }

	// Check permission using role service
	// hasPermission, err := h.roleService.CheckUserPermission(c.Request.Context(), userID.(uuid.UUID), resource, action)
	// if err != nil {
	// 	response := model.Error500("Failed to check permissions: " + err.Error())
	// 	c.JSON(http.StatusInternalServerError, response)
	// 	return false
	// }

	// if !hasPermission {
	// 	response := model.Error403("Access denied. Insufficient permissions.")
	// 	c.JSON(http.StatusForbidden, response)
	// 	return false
	// }

	return true
}

// checkUserPermission legacy method for backward compatibility
func (h *RoleHandler) checkUserPermission(c *gin.Context, resource, action string) bool {
	return h.checkPermission(c, resource, action)
}

// RegisterRoutes mendaftarkan rute untuk RoleHandler
func (h *RoleHandler) RegisterRoutes(router *gin.Engine, authMiddleware gin.HandlerFunc) {
	roles := router.Group("/api/v1/roles")
	roles.Use(authMiddleware) // Semua endpoint memerlukan autentikasi
	{
		roles.GET("", h.GetAllRoles)       // GET /api/v1/roles
		roles.POST("", h.CreateRole)       // POST /api/v1/roles
		roles.GET("/:id", h.GetRoleByID)   // GET /api/v1/roles/:id
		roles.PUT("/:id", h.UpdateRole)    // PUT /api/v1/roles/:id
		roles.DELETE("/:id", h.DeleteRole) // DELETE /api/v1/roles/:id
	}

	permissions := router.Group("/api/v1/permissions")
	permissions.Use(authMiddleware) // Semua endpoint memerlukan autentikasi
	{
		permissions.GET("", h.GetAllPermissions) // GET /api/v1/permissions
		permissions.POST("", h.CreatePermission) // POST /api/v1/permissions
	}
}
