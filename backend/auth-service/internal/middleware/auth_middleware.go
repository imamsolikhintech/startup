package middleware

import (
	"net/http"
	"strings"

	"github.com/auth-service/internal/model"
	"github.com/auth-service/internal/service"
	"github.com/auth-service/internal/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware adalah middleware untuk memvalidasi JWT token
func AuthMiddleware(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Set header keamanan
		utils.SetSecureHeaders(c)

		// Dapatkan token dari header Authorization
		authHeader := c.GetHeader("Authorization")
		tokenString, err := utils.ExtractTokenFromHeader(authHeader)
		if err != nil || tokenString == "" {
			// Coba dapatkan dari cookie
			tokenCookie, err := c.Cookie("access_token")
			if err != nil || tokenCookie == "" {
				response := model.Error401("Authorization token is required")
				c.AbortWithStatusJSON(http.StatusUnauthorized, response)
				return
			}
			tokenString = tokenCookie
		}

		// Validasi token
		claims, err := authService.ValidateToken(c.Request.Context(), tokenString)
		if err != nil {
			response := model.Error401("Invalid or expired token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		// Get user ID from claims
		userID := claims.UserID

		// Token already validated by ValidateToken call above

		// Verifikasi apakah user masih aktif
		user, err := authService.GetUserByID(c.Request.Context(), userID)
		if err != nil || !user.Active {
			response := model.Error403("User account is inactive or not found")
			c.AbortWithStatusJSON(http.StatusForbidden, response)
			return
		}

		// Set user ID ke konteks untuk digunakan oleh handler
		c.Set("user_id", userID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// RoleMiddleware adalah middleware untuk memeriksa peran pengguna
func RoleMiddleware(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Dapatkan peran pengguna dari konteks
		userRole, exists := c.Get("user_role")
		if !exists {
			response := model.Error401("Unauthorized")
			c.AbortWithStatusJSON(http.StatusUnauthorized, response)
			return
		}

		// Periksa apakah pengguna memiliki peran yang diperlukan
		hasRole := false
		for _, role := range roles {
			if strings.EqualFold(userRole.(string), role) {
				hasRole = true
				break
			}
		}

		if !hasRole {
			response := model.Error403("Insufficient permissions")
			c.AbortWithStatusJSON(http.StatusForbidden, response)
			return
		}

		c.Next()
	}
}

// RateLimitMiddleware adalah middleware untuk membatasi jumlah request
func RateLimitMiddleware(authService service.AuthService, limit int, duration int) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Dapatkan IP address pengguna
		ip := utils.GetClientIP(c)

		// Periksa apakah IP telah mencapai batas rate
		allowed, err := authService.CheckRateLimit(c.Request.Context(), ip, c.FullPath(), limit, duration)
		if err != nil || !allowed {
			response := model.Error429("Rate limit exceeded. Please try again later")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, response)
			return
		}

		c.Next()
	}
}
