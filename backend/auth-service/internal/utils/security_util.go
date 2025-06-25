package utils

import (
	"crypto/rand"
	"encoding/base64"
	"html"
	"net"
	"strings"

	"github.com/gin-gonic/gin"
)

// SanitizeInput membersihkan input dari karakter berbahaya
func SanitizeInput(input string) string {
	// Escape HTML entities
	sanitized := html.EscapeString(input)

	// Hapus karakter kontrol
	sanitized = strings.Map(func(r rune) rune {
		if r < 32 || r == 127 {
			return -1
		}
		return r
	}, sanitized)

	return sanitized
}

// GenerateCSRFToken menghasilkan token CSRF
func GenerateCSRFToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(b), nil
}

// GetClientIP mendapatkan alamat IP klien dari request
func GetClientIP(c *gin.Context) string {
	// Cek header X-Forwarded-For
	forwardedFor := c.Request.Header.Get("X-Forwarded-For")
	if forwardedFor != "" {
		// X-Forwarded-For bisa berisi beberapa IP, ambil yang pertama
		parts := strings.Split(forwardedFor, ",")
		ip := strings.TrimSpace(parts[0])
		return ip
	}

	// Cek header X-Real-IP
	realIP := c.Request.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	// Dapatkan IP dari RemoteAddr
	ip, _, err := net.SplitHostPort(c.Request.RemoteAddr)
	if err != nil {
		return c.Request.RemoteAddr
	}

	return ip
}

// GetUserAgent mendapatkan user agent dari request
func GetUserAgent(c *gin.Context) string {
	return c.Request.UserAgent()
}

// IsValidEmail memeriksa apakah email valid
func IsValidEmail(email string) bool {
	// Implementasi sederhana, bisa diganti dengan validasi yang lebih kompleks
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// SetSecureHeaders mengatur header keamanan untuk respons HTTP
func SetSecureHeaders(c *gin.Context) {
	// Prevent MIME sniffing
	c.Header("X-Content-Type-Options", "nosniff")

	// Prevent clickjacking
	c.Header("X-Frame-Options", "DENY")

	// XSS protection
	c.Header("X-XSS-Protection", "1; mode=block")

	// Content Security Policy
	c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self'; media-src 'self'; frame-src 'none'; font-src 'self'; connect-src 'self'")

	// HTTP Strict Transport Security
	c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

	// Referrer Policy
	c.Header("Referrer-Policy", "no-referrer-when-downgrade")

	// Feature Policy
	c.Header("Feature-Policy", "camera 'none'; microphone 'none'; geolocation 'none'")
}

// DetectSuspiciousLogin mendeteksi login yang mencurigakan
func DetectSuspiciousLogin(c *gin.Context, knownIP, knownUserAgent string) bool {
	// Dapatkan IP dan user agent saat ini
	currentIP := GetClientIP(c)
	currentUserAgent := GetUserAgent(c)

	// Jika ini adalah login pertama, tidak ada yang mencurigakan
	if knownIP == "" || knownUserAgent == "" {
		return false
	}

	// Jika IP dan user agent sama dengan yang diketahui, tidak mencurigakan
	if currentIP == knownIP && currentUserAgent == knownUserAgent {
		return false
	}

	// Jika IP berbeda dan user agent berbeda, sangat mencurigakan
	if currentIP != knownIP && currentUserAgent != knownUserAgent {
		return true
	}

	// Jika hanya IP yang berbeda, mungkin mencurigakan (tergantung kebijakan)
	// Untuk implementasi sederhana, kita anggap mencurigakan
	return true
}

// ValidateRequestOrigin memvalidasi origin request untuk mencegah CSRF
func ValidateRequestOrigin(c *gin.Context, allowedOrigins []string) bool {
	origin := c.Request.Header.Get("Origin")
	referer := c.Request.Header.Get("Referer")

	// Jika tidak ada origin atau referer, tolak request
	if origin == "" && referer == "" {
		return false
	}

	// Jika ada origin, periksa apakah termasuk dalam allowed origins
	if origin != "" {
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				return true
			}
		}
	}

	// Jika ada referer, periksa apakah domain-nya termasuk dalam allowed origins
	if referer != "" {
		for _, allowed := range allowedOrigins {
			if strings.HasPrefix(referer, allowed) {
				return true
			}
		}
	}

	return false
}

// SetCookie mengatur cookie dengan opsi keamanan
func SetCookie(c *gin.Context, name, value string, maxAge int, path string, secure, httpOnly bool) {
	c.SetCookie(name, value, maxAge, path, "", secure, httpOnly)

	// Set SameSite attribute
	if secure {
		c.Writer.Header().Add("Set-Cookie", name+"="+value+"; SameSite=Strict")
	} else {
		c.Writer.Header().Add("Set-Cookie", name+"="+value+"; SameSite=Lax")
	}
}

// ClearCookie menghapus cookie
func ClearCookie(c *gin.Context, name, path string, secure, httpOnly bool) {
	c.SetCookie(name, "", -1, path, "", secure, httpOnly)
}
