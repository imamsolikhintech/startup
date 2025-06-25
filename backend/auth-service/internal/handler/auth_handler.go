package handler

import (
	"fmt"
	"log"
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

// AuthHandler menangani request autentikasi
type AuthHandler struct {
	authService service.AuthService
	validator   *validator.Validate
}

// NewAuthHandler membuat instance baru AuthHandler
func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		validator:   validator.New(),
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.RegisterRequest true "Register request"
// @Success 201 {object} model.UserResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 429 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Parse request body
	var req model.RegisterRequest
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
	req.Email = strings.TrimSpace(req.Email)
	req.Name = utils.SanitizeInput(strings.TrimSpace(req.Name))

	// Validasi email
	if !utils.IsValidEmail(req.Email) {
		response := model.Error400("Invalid email format")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Validasi password
	if !utils.IsStrongPassword(req.Password, 8) {
		response := model.Error400("Password must be at least 8 characters and include uppercase, lowercase, number, and special character")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Dapatkan informasi klien
	clientInfo := &service.ClientInfo{
		IP:        utils.GetClientIP(c),
		UserAgent: utils.GetUserAgent(c),
		Country:   c.Request.Header.Get("CF-IPCountry"), // Cloudflare header, bisa disesuaikan
		City:      "",                                   // Bisa diisi dari layanan geolokasi
	}

	// Process registration with pointer to request
	user, err := h.authService.Register(c.Request.Context(), &req, clientInfo)
	if err != nil {
		var response model.StandardResponse
		switch err {
		case service.ErrUserAlreadyExists:
			response = model.Error409("Email already registered")
			c.JSON(http.StatusConflict, response)
		case service.ErrPasswordTooWeak:
			response = model.Error400("Password is too weak")
			c.JSON(http.StatusBadRequest, response)
		case service.ErrRateLimitExceeded:
			response = model.Error429("Rate limit exceeded. Please try again later")
			c.JSON(http.StatusTooManyRequests, response)
		default:
			response = model.Error500("Failed to register user")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	response := model.Success201(user, "User registered successfully")
	c.JSON(http.StatusCreated, response)
}

// Login godoc
// @Summary Login user
// @Description Authenticate user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.LoginRequest true "Login request"
// @Success 200 {object} model.TokenResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Parse request body
	var req model.LoginRequest
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
	req.Email = strings.TrimSpace(req.Email)

	// Dapatkan informasi klien
	clientInfo := &service.ClientInfo{
		IP:        utils.GetClientIP(c),
		UserAgent: utils.GetUserAgent(c),
		Country:   c.Request.Header.Get("CF-IPCountry"), // Cloudflare header, bisa disesuaikan
		City:      "",                                   // Bisa diisi dari layanan geolokasi
	}

	// Proses login
	tokenResponse, err := h.authService.Login(c.Request.Context(), &req, clientInfo)
	if err != nil {
		var response model.StandardResponse
		switch err {
		case service.ErrInvalidCredentials:
			response = model.Error401("Invalid email or password")
			c.JSON(http.StatusUnauthorized, response)
		case service.ErrAccountLocked:
			response = model.Error403("Account is locked due to too many failed login attempts")
			c.JSON(http.StatusForbidden, response)
		case service.ErrUserInactive:
			response = model.Error403("User account is inactive")
			c.JSON(http.StatusForbidden, response)
		case service.ErrRateLimitExceeded:
			response = model.Error429("Rate limit exceeded. Please try again later")
			c.JSON(http.StatusTooManyRequests, response)
		default:
			response = model.Error500("Failed to login")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	// Set cookies untuk access token dan refresh token
	utils.SetCookie(c, "access_token", tokenResponse.AccessToken, 60*60*24, "/", c.Request.TLS != nil, true)     // 1 day
	utils.SetCookie(c, "refresh_token", tokenResponse.RefreshToken, 60*60*24*7, "/", c.Request.TLS != nil, true) // 7 days

	response := model.Success200(tokenResponse, "Login successful")
	c.JSON(http.StatusOK, response)
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Get new access token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} model.TokenResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Dapatkan refresh token dari request
	var req model.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Coba dapatkan dari cookie jika tidak ada di body
		refreshToken, err := c.Cookie("refresh_token")
		if err != nil || refreshToken == "" {
			response := model.Error400("Refresh token is required")
			c.JSON(http.StatusBadRequest, response)
			return
		}
		req.RefreshToken = refreshToken
	}

	// Validasi request
	if req.RefreshToken == "" {
		response := model.Error400("Refresh token is required")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Proses refresh token
	tokenResponse, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		var response model.StandardResponse
		switch err {
		case service.ErrInvalidRefreshToken:
			response = model.Error401("Invalid refresh token")
			c.JSON(http.StatusUnauthorized, response)
		case service.ErrUserInactive:
			response = model.Error403("User account is inactive")
			c.JSON(http.StatusForbidden, response)
		default:
			response = model.Error500("Failed to refresh token")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	// Update cookies untuk access token dan refresh token
	utils.SetCookie(c, "access_token", tokenResponse.AccessToken, 60*60*24, "/", c.Request.TLS != nil, true)     // 1 day
	utils.SetCookie(c, "refresh_token", tokenResponse.RefreshToken, 60*60*24*7, "/", c.Request.TLS != nil, true) // 7 days

	response := model.Success200(tokenResponse, "Token refreshed successfully")
	c.JSON(http.StatusOK, response)
}

// Logout godoc
// @Summary Logout user
// @Description Logout user and invalidate refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.LogoutRequest true "Logout request"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Dapatkan user ID dari konteks (diisi oleh middleware auth)
	userID, exists := c.Get("user_id")
	if !exists {
		response := model.Error401("Unauthorized")
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Dapatkan refresh token dari request atau cookie
	var req model.LogoutRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		// Coba dapatkan dari cookie jika tidak ada di body
		refreshToken, err := c.Cookie("refresh_token")
		if err != nil || refreshToken == "" {
			response := model.Error400("Refresh token is required")
			c.JSON(http.StatusBadRequest, response)
			return
		}
		req.RefreshToken = refreshToken
	}

	// Proses logout
	err := h.authService.Logout(c.Request.Context(), userID.(uuid.UUID), req.RefreshToken)
	if err != nil {
		// Log error untuk debugging
		log.Printf("Logout failed for user %s: %v", userID.(uuid.UUID).String(), err)
		response := model.Error500("Failed to logout")
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	// Hapus cookies access token dan refresh token
	utils.ClearCookie(c, "access_token", "/", c.Request.TLS != nil, true)
	utils.ClearCookie(c, "refresh_token", "/", c.Request.TLS != nil, true)

	response := model.Success200(nil, "Logged out successfully")
	c.JSON(http.StatusOK, response)
}

// GetMe godoc
// @Summary Get current user info
// @Description Get information about the currently authenticated user
// @Tags auth
// @Accept json
// @Produce json
// @Success 200 {object} model.UserResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /auth/me [get]
func (h *AuthHandler) GetMe(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Dapatkan user ID dari konteks (diisi oleh middleware auth)
	userID, exists := c.Get("user_id")
	if !exists {
		response := model.Error401("Unauthorized")
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Dapatkan data pengguna
	user, err := h.authService.GetUserByID(c.Request.Context(), userID.(uuid.UUID))
	if err != nil {
		response := model.Error500("Failed to get user data")
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	response := model.Success200(user, "User data retrieved successfully")
	c.JSON(http.StatusOK, response)
}

// GoogleLogin godoc
// @Summary Login with Google
// @Description Redirect to Google OAuth login page
// @Tags auth
// @Accept json
// @Produce json
// @Param redirect_url query string false "URL to redirect after successful login"
// @Success 307 {string} string "Redirect to Google"
// @Router /auth/google/login [get]
func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Dapatkan redirect_url dari query parameter
	redirectURL := c.Query("redirect_url")

	// Dapatkan URL untuk autentikasi Google dengan redirect URL
	url := h.authService.GetGoogleAuthURL(redirectURL)
	// Redirect to Google OAuth URL
	c.Redirect(http.StatusTemporaryRedirect, url)
	// c.JSON(http.StatusOK, gin.H{"url": url})
}

// GoogleCallback godoc
// @Summary Google OAuth callback
// @Description Handle callback from Google OAuth
// @Tags auth
// @Accept json
// @Produce json
// @Param code query string true "Authorization code from Google"
// @Param state query string false "State parameter for CSRF protection"
// @Success 200 {object} model.TokenResponse
// @Success 307 {string} string "Redirect to frontend with token"
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/google/callback [get]
func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Dapatkan code dan state dari query parameter
	code := c.Query("code")
	state := c.Query("state")

	// Log parameter untuk debugging
	fmt.Printf("Google Callback received: code=%s, state=%s\n", code, state)

	if code == "" {
		response := model.Error400("Authorization code is required")
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Dapatkan informasi klien
	clientInfo := &service.ClientInfo{
		IP:        utils.GetClientIP(c),
		UserAgent: utils.GetUserAgent(c),
		Country:   c.Request.Header.Get("CF-IPCountry"), // Cloudflare header, bisa disesuaikan
		City:      "",                                   // Bisa diisi dari layanan geolokasi
	}

	// Proses callback
	// Tambahkan state ke clientInfo untuk validasi
	if clientInfo.UserAgent == "" {
		clientInfo.UserAgent = "unknown"
	}

	// Log untuk debugging
	fmt.Printf("Calling HandleGoogleCallback with code length: %d\n", len(code))

	tokenResponse, err := h.authService.HandleGoogleCallback(c.Request.Context(), code, clientInfo)
	if err != nil {
		// Log error untuk debugging
		fmt.Printf("Google callback error: %v\n", err)

		var response model.StandardResponse
		switch err {
		case service.ErrGoogleAuthFailed:
			response = model.Error400("Google authentication failed")
			c.JSON(http.StatusBadRequest, response)
		case service.ErrUserInactive:
			response = model.Error403("User account is inactive")
			c.JSON(http.StatusForbidden, response)
		default:
			response = model.Error500("Failed to authenticate with Google")
			c.JSON(http.StatusInternalServerError, response)
		}
		return
	}

	// Set cookies untuk access token dan refresh token
	utils.SetCookie(c, "access_token", tokenResponse.AccessToken, 60*60*24, "/", c.Request.TLS != nil, true)     // 1 day
	utils.SetCookie(c, "refresh_token", tokenResponse.RefreshToken, 60*60*24*7, "/", c.Request.TLS != nil, true) // 7 days

	// Dapatkan redirect URL dari state jika ada
	redirectURL := h.authService.GetRedirectURLFromState(state)
	if redirectURL != "" {
		// Redirect ke URL yang diminta dengan token sebagai query parameter
		separator := "?"
		if strings.Contains(redirectURL, "?") {
			separator = "&"
		}
		finalURL := fmt.Sprintf("%s%saccess_token=%s&refresh_token=%s&token_type=%s",
			redirectURL, separator, tokenResponse.AccessToken, tokenResponse.RefreshToken, tokenResponse.TokenType)
		c.Redirect(http.StatusTemporaryRedirect, finalURL)
		return
	}

	// Jika tidak ada redirect URL, kembalikan token sebagai JSON
	response := model.Success200(tokenResponse, "Google authentication successful")
	c.JSON(http.StatusOK, response)
}

// GetLoginHistory godoc
// @Summary Get login history
// @Description Get user's login history
// @Tags auth
// @Accept json
// @Produce json
// @Param limit query int false "Limit number of records" default(10)
// @Success 200 {array} model.LoginHistory
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /auth/login-history [get]
func (h *AuthHandler) GetLoginHistory(c *gin.Context) {
	// Set header keamanan
	utils.SetSecureHeaders(c)

	// Dapatkan user ID dari konteks (diisi oleh middleware auth)
	userID, exists := c.Get("user_id")
	if !exists {
		response := model.Error401("Unauthorized")
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Dapatkan limit dari query parameter
	limit := 10 // Default limit
	limitParam := c.DefaultQuery("limit", "10")
	if limitParam != "" {
		if n, err := strconv.Atoi(limitParam); err == nil && n > 0 {
			limit = n
		}
	}

	// Dapatkan riwayat login
	history, err := h.authService.GetLoginHistory(c.Request.Context(), userID.(uuid.UUID), limit)
	if err != nil {
		response := model.Error500("Failed to get login history")
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	response := model.Success200(history, "Login history retrieved successfully")
	c.JSON(http.StatusOK, response)
}

// RegisterRoutes mendaftarkan semua rute autentikasi
func (h *AuthHandler) RegisterRoutes(router *gin.Engine, authMiddleware gin.HandlerFunc) {
	// Public routes (tidak memerlukan autentikasi)
	public := router.Group("/api/v1/auth")
	{
		public.POST("/register", h.Register)
		public.POST("/login", h.Login)
		public.POST("/refresh", h.RefreshToken)
		public.GET("/google/login", h.GoogleLogin)
		public.GET("/google/callback", h.GoogleCallback)
	}

	// Protected routes (memerlukan autentikasi)
	protected := router.Group("/api/v1/auth")
	protected.Use(authMiddleware)
	{
		protected.GET("/me", h.GetMe)
		protected.POST("/logout", h.Logout)
		protected.GET("/login-history", h.GetLoginHistory)
	}

	// User management routes (akan didaftarkan oleh UserHandler)
	// Ini hanya komentar untuk dokumentasi - UserHandler akan mendaftarkan rutenya sendiri
}
