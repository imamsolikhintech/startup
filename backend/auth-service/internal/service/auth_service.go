package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/auth-service/config"
	"github.com/auth-service/internal/model"
	"github.com/auth-service/internal/repository"
	"github.com/auth-service/internal/utils"
	"github.com/google/uuid"
	"github.com/mssola/user_agent"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// Errors
var (
	ErrInvalidCredentials  = errors.New("invalid email or password")
	ErrUserAlreadyExists   = errors.New("user already exists")
	ErrInvalidToken        = errors.New("invalid token")
	ErrAccountLocked       = errors.New("account is locked due to too many failed login attempts")
	ErrUserInactive        = errors.New("user account is inactive")
	ErrPasswordTooWeak     = errors.New("password is too weak")
	ErrInvalidRefreshToken = errors.New("invalid refresh token")
	ErrRateLimitExceeded   = errors.New("rate limit exceeded")
	ErrInternalServerError = errors.New("internal server error")
	ErrGoogleAuthFailed    = errors.New("google authentication failed")
	ErrUserNotFound        = errors.New("user not found")
	ErrUnauthorized        = errors.New("unauthorized access")
	ErrInvalidRole         = errors.New("invalid role")
)

// AuthService interface untuk layanan autentikasi
type AuthService interface {
	Register(ctx context.Context, req *model.RegisterRequest, clientInfo *ClientInfo) (*model.UserResponse, error)
	Login(ctx context.Context, req *model.LoginRequest, clientInfo *ClientInfo) (*model.TokenResponse, error)
	Logout(ctx context.Context, userID uuid.UUID, refreshToken string) error
	RefreshToken(ctx context.Context, refreshToken string) (*model.TokenResponse, error)
	GetUserProfile(ctx context.Context, userID uuid.UUID) (*model.UserResponse, error)
	GetUserByID(ctx context.Context, userID uuid.UUID) (*model.UserResponse, error)
	ValidateToken(ctx context.Context, tokenString string) (*utils.JWTClaims, error)
	GetGoogleAuthURL(redirectURL string) string
	GetRedirectURLFromState(state string) string
	HandleGoogleCallback(ctx context.Context, code string, clientInfo *ClientInfo) (*model.TokenResponse, error)
	GetLoginHistory(ctx context.Context, userID uuid.UUID, limit int) ([]model.LoginHistory, error)
	CheckRateLimit(ctx context.Context, key string, path string, limit int, duration int) (bool, error)
	// User Management methods
	GetAllUsers(ctx context.Context, page, limit int, search string) (*model.UsersListResponse, error)
	UpdateUser(ctx context.Context, userID uuid.UUID, req *model.UpdateUserRequest) (*model.UserResponse, error)
	GetUserStats(ctx context.Context) (*model.UserStats, error)
	GetUserActivity(ctx context.Context, userID uuid.UUID, days int) ([]model.UserActivity, error)
	GetUserActivityResponse(ctx context.Context, userID uuid.UUID, days int) (*model.UserActivityResponse, error)
}

// ClientInfo menyimpan informasi klien untuk login
type ClientInfo struct {
	IP        string
	UserAgent string
	Country   string
	City      string
}

// authService implementasi AuthService
type authService struct {
	userRepo       repository.UserRepository
	tokenRepo      repository.TokenRepository
	config         *config.Config
	googleOAuthCfg *oauth2.Config
}

// NewAuthService membuat instance baru AuthService
func NewAuthService(userRepo repository.UserRepository, tokenRepo repository.TokenRepository, cfg *config.Config) AuthService {
	// Konfigurasi Google OAuth
	googleOAuthCfg := &oauth2.Config{
		ClientID:     cfg.Google.ClientID,
		ClientSecret: cfg.Google.ClientSecret,
		RedirectURL:  cfg.Google.RedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &authService{
		userRepo:       userRepo,
		tokenRepo:      tokenRepo,
		config:         cfg,
		googleOAuthCfg: googleOAuthCfg,
	}
}

// Register mendaftarkan pengguna baru
func (s *authService) Register(ctx context.Context, req *model.RegisterRequest, clientInfo *ClientInfo) (*model.UserResponse, error) {
	// Validasi password
	if len(req.Password) < s.config.Security.PasswordMinLength {
		return nil, ErrPasswordTooWeak
	}

	// Cek rate limit untuk registrasi
	key := fmt.Sprintf("register:%s", req.Email)
	allowed, err := s.tokenRepo.CheckRateLimit(ctx, key, s.config.Security.RateLimitRequests, s.config.Security.RateLimitDuration)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, ErrRateLimitExceeded
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, ErrInternalServerError
	}

	// Buat user baru
	user := &model.User{
		Email:     req.Email,
		Password:  hashedPassword,
		Name:      req.Name,
		Provider:  "local",
		Role:      "user",
		Verified:  false,
		Active:    true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Simpan user ke database
	err = s.userRepo.Create(ctx, user)
	if err != nil {
		if errors.Is(err, repository.ErrEmailAlreadyExists) {
			return nil, ErrUserAlreadyExists
		}
		return nil, ErrInternalServerError
	}

	// Konversi ke response
	userResponse := user.ToUserResponse()

	// Cache data user
	s.tokenRepo.CacheUserData(ctx, user.ID, &userResponse, 1*time.Hour)

	return &userResponse, nil
}

// Login melakukan autentikasi pengguna
func (s *authService) Login(ctx context.Context, req *model.LoginRequest, clientInfo *ClientInfo) (*model.TokenResponse, error) {
	// Cek rate limit untuk login
	key := fmt.Sprintf("login:%s", req.Email)
	allowed, err := s.tokenRepo.CheckRateLimit(ctx, key, s.config.Security.RateLimitRequests, s.config.Security.RateLimitDuration)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, ErrRateLimitExceeded
	}

	// Cari user berdasarkan email
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, ErrInternalServerError
	}

	// Cek apakah akun aktif
	if !user.Active {
		return nil, ErrUserInactive
	}

	// Cek apakah akun terkunci
	if user.LockedUntil != nil && time.Now().Before(*user.LockedUntil) {
		return nil, ErrAccountLocked
	}

	// Verifikasi password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		// Tambah jumlah percobaan login yang gagal
		s.userRepo.IncrementLoginAttempts(ctx, user.ID)

		// Jika melebihi batas percobaan, kunci akun
		if user.LoginAttempts+1 >= s.config.Security.MaxLoginAttempts {
			s.userRepo.LockAccount(ctx, user.ID, s.config.Security.LockoutDuration)
		}

		// Catat riwayat login gagal
		loginHistory := createLoginHistory(user.ID, clientInfo, false, "Invalid password")
		s.userRepo.SaveLoginHistory(ctx, loginHistory)

		return nil, ErrInvalidCredentials
	}

	// Reset percobaan login
	s.userRepo.ResetLoginAttempts(ctx, user.ID)

	// Update waktu login terakhir
	now := time.Now()
	s.userRepo.UpdateLastLogin(ctx, user.ID, now)

	// Catat riwayat login berhasil
	loginHistory := createLoginHistory(user.ID, clientInfo, true, "")
	s.userRepo.SaveLoginHistory(ctx, loginHistory)

	// Generate token
	tokenResponse, err := s.generateTokens(ctx, user)
	if err != nil {
		return nil, ErrInternalServerError
	}

	return tokenResponse, nil
}

// RefreshToken memperbaharui token akses
func (s *authService) RefreshToken(ctx context.Context, refreshToken string) (*model.TokenResponse, error) {
	// Parse token
	claims, err := utils.ParseRefreshToken(refreshToken, s.config.JWT.SecretKey)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	// Validasi token di Redis
	err = s.tokenRepo.ValidateRefreshToken(ctx, claims.UserID, claims.TokenID)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	// Dapatkan data user
	user, err := s.userRepo.FindByID(ctx, claims.UserID)
	if err != nil {
		return nil, ErrInternalServerError
	}

	// Cek apakah akun aktif
	if !user.Active {
		return nil, ErrUserInactive
	}

	// Generate token baru
	tokenResponse, err := s.generateTokens(ctx, user)
	if err != nil {
		return nil, ErrInternalServerError
	}

	// Cabut token lama
	s.tokenRepo.RevokeRefreshToken(ctx, claims.UserID, claims.TokenID)

	return tokenResponse, nil
}

// Logout mengeluarkan pengguna
func (s *authService) Logout(ctx context.Context, userID uuid.UUID, refreshToken string) error {
	// Parse token
	claims, err := utils.ParseRefreshToken(refreshToken, s.config.JWT.SecretKey)
	if err != nil {
		return ErrInvalidRefreshToken
	}

	// Cabut token
	err = s.tokenRepo.RevokeRefreshToken(ctx, userID, claims.TokenID)
	if err != nil {
		return err
	}

	// Hapus sesi pengguna
	s.tokenRepo.DeleteUserSession(ctx, userID)

	return nil
}

// GetUserByID mendapatkan data pengguna berdasarkan ID
func (s *authService) GetUserProfile(ctx context.Context, userID uuid.UUID) (*model.UserResponse, error) {
	return s.GetUserByID(ctx, userID)
}

func (s *authService) GetUserByID(ctx context.Context, userID uuid.UUID) (*model.UserResponse, error) {
	// Coba dapatkan dari cache
	cachedUser, err := s.tokenRepo.GetCachedUserData(ctx, userID)
	if err == nil {
		return cachedUser, nil
	}

	// Jika tidak ada di cache, ambil dari database
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, repository.ErrUserNotFound
		}
		return nil, ErrInternalServerError
	}

	// Konversi ke response
	userResponse := user.ToUserResponse()

	// Cache data user
	s.tokenRepo.CacheUserData(ctx, userID, &userResponse, 1*time.Hour)

	return &userResponse, nil
}

// GetGoogleAuthURL mendapatkan URL untuk autentikasi Google
func (s *authService) GetGoogleAuthURL(redirectURL string) string {
	// Generate random state
	state := utils.GenerateRandomString(32)

	// Simpan state dan redirect URL ke Redis untuk validasi nanti
	ctx := context.Background()
	sessionData := map[string]string{
		"state": state,
	}
	if redirectURL != "" {
		sessionData["redirect_url"] = redirectURL
	}

	// Simpan dengan state sebagai key
	if err := s.tokenRepo.StoreOAuthState(ctx, state, sessionData, 15*time.Minute); err != nil {
		fmt.Printf("Failed to store OAuth state: %v\n", err)
	}

	// Log konfigurasi OAuth untuk debugging
	fmt.Printf("Google OAuth Config: ClientID=%s, RedirectURL=%s\n", s.googleOAuthCfg.ClientID, s.googleOAuthCfg.RedirectURL)

	return s.googleOAuthCfg.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// GetRedirectURLFromState mengambil redirect URL dari state yang disimpan
func (s *authService) GetRedirectURLFromState(state string) string {
	ctx := context.Background()

	// Ambil session data dari Redis berdasarkan state
	sessionData, err := s.tokenRepo.GetOAuthState(ctx, state)
	if err != nil {
		fmt.Printf("Failed to get OAuth state: %v\n", err)
		return ""
	}

	// Validasi state
	if sessionData["state"] != state {
		fmt.Printf("State mismatch: expected %s, got %s\n", sessionData["state"], state)
		return ""
	}

	// Kembalikan redirect URL jika ada
	if redirectURL, exists := sessionData["redirect_url"]; exists {
		return redirectURL
	}

	return ""
}

// HandleGoogleCallback menangani callback dari Google OAuth
func (s *authService) HandleGoogleCallback(ctx context.Context, code string, clientInfo *ClientInfo) (*model.TokenResponse, error) {
	// Log untuk debugging
	fmt.Printf("HandleGoogleCallback called with code: %s\n", code)

	// Exchange authorization code dengan token
	oauth2Token, err := s.googleOAuthCfg.Exchange(ctx, code)
	if err != nil {
		// Log error detail untuk debugging
		fmt.Printf("Google OAuth Exchange error: %v\n", err)
		fmt.Printf("Google OAuth Config: ClientID=%s, RedirectURL=%s\n", s.googleOAuthCfg.ClientID, s.googleOAuthCfg.RedirectURL)
		return nil, ErrGoogleAuthFailed
	}

	// Dapatkan data pengguna dari Google
	client := s.googleOAuthCfg.Client(ctx, oauth2Token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return nil, ErrGoogleAuthFailed
	}
	defer resp.Body.Close()

	// Parse respons
	var googleUser struct {
		Sub           string `json:"sub"`
		Email         string `json:"email"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
		EmailVerified bool   `json:"email_verified"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, ErrGoogleAuthFailed
	}

	// Cari user berdasarkan provider ID
	user, err := s.userRepo.FindByProviderID(ctx, "google", googleUser.Sub)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			// User belum ada, buat user baru
			user = &model.User{
				Email:          googleUser.Email,
				Name:           googleUser.Name,
				ProfilePicture: googleUser.Picture,
				Provider:       "google",
				ProviderID:     googleUser.Sub,
				Role:           "user",
				Verified:       googleUser.EmailVerified,
				Active:         true,
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
			}

			// Simpan user ke database
			err = s.userRepo.Create(ctx, user)
			if err != nil {
				// Jika email sudah ada, coba update user yang ada
				if errors.Is(err, repository.ErrEmailAlreadyExists) {
					existingUser, err := s.userRepo.FindByEmail(ctx, googleUser.Email)
					if err != nil {
						return nil, ErrInternalServerError
					}

					// Update user dengan data Google
					existingUser.Provider = "google"
					existingUser.ProviderID = googleUser.Sub
					existingUser.ProfilePicture = googleUser.Picture
					existingUser.Verified = googleUser.EmailVerified
					existingUser.UpdatedAt = time.Now()

					err = s.userRepo.Update(ctx, existingUser)
					if err != nil {
						return nil, ErrInternalServerError
					}

					user = existingUser
				} else {
					return nil, ErrInternalServerError
				}
			}
		} else {
			return nil, ErrInternalServerError
		}
	}

	// Cek apakah akun aktif
	if !user.Active {
		return nil, ErrUserInactive
	}

	// Update waktu login terakhir
	now := time.Now()
	s.userRepo.UpdateLastLogin(ctx, user.ID, now)

	// Catat riwayat login berhasil
	loginHistory := createLoginHistory(user.ID, clientInfo, true, "")
	s.userRepo.SaveLoginHistory(ctx, loginHistory)

	// Generate token
	tokenResponse, err := s.generateTokens(ctx, user)
	if err != nil {
		return nil, ErrInternalServerError
	}

	return tokenResponse, nil
}

// ValidateToken memvalidasi token JWT
func (s *authService) ValidateToken(ctx context.Context, tokenString string) (*utils.JWTClaims, error) {
	// Parse token
	claims, err := utils.ParseAccessToken(tokenString, s.config.JWT.SecretKey)
	if err != nil {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// GetLoginHistory mendapatkan riwayat login pengguna
func (s *authService) GetLoginHistory(ctx context.Context, userID uuid.UUID, limit int) ([]model.LoginHistory, error) {
	return s.userRepo.GetLoginHistory(ctx, userID, limit)
}

// generateTokens menghasilkan access token dan refresh token
func (s *authService) generateTokens(ctx context.Context, user *model.User) (*model.TokenResponse, error) {
	// Generate token ID
	tokenID := utils.GenerateRandomString(32)

	// Generate access token
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, s.config.JWT.SecretKey, s.config.JWT.AccessTokenExpiry)
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshToken, err := utils.GenerateRefreshToken(user.ID, tokenID, s.config.JWT.SecretKey, s.config.JWT.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	// Simpan refresh token ke Redis
	err = s.tokenRepo.StoreRefreshToken(ctx, user.ID, tokenID, s.config.JWT.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	// Konversi user ke response
	userResponse := user.ToUserResponse()

	// Cache data user
	s.tokenRepo.CacheUserData(ctx, user.ID, &userResponse, 1*time.Hour)

	return &model.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.config.JWT.AccessTokenExpiry / time.Second),
		TokenType:    "Bearer",
		User:         userResponse,
	}, nil
}

// createLoginHistory membuat objek riwayat login
func createLoginHistory(userID uuid.UUID, clientInfo *ClientInfo, success bool, failureReason string) *model.LoginHistory {
	ua := user_agent.New(clientInfo.UserAgent)
	browser, version := ua.Browser()

	return &model.LoginHistory{
		UserID:        userID,
		IP:            clientInfo.IP,
		UserAgent:     clientInfo.UserAgent,
		DeviceInfo:    ua.Model(),
		Browser:       fmt.Sprintf("%s %s", browser, version),
		OS:            ua.OS(),
		Country:       clientInfo.Country,
		City:          clientInfo.City,
		Success:       success,
		FailureReason: failureReason,
		LoginTime:     time.Now(),
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
}

// CheckRateLimit memeriksa apakah permintaan melebihi batas rate
func (s *authService) CheckRateLimit(ctx context.Context, key string, path string, limit int, duration int) (bool, error) {
	// Buat kunci unik berdasarkan IP dan path
	fullKey := fmt.Sprintf("rate_limit:%s:%s", key, path)
	return s.tokenRepo.CheckRateLimit(ctx, fullKey, limit, time.Duration(duration)*time.Second)
}

// GetAllUsers mendapatkan semua user dengan pagination
func (s *authService) GetAllUsers(ctx context.Context, page, limit int, search string) (*model.UsersListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	users, total, err := s.userRepo.GetAllUsers(ctx, offset, limit, search)
	if err != nil {
		return nil, ErrInternalServerError
	}

	// Konversi ke UserResponse
	userResponses := make([]model.UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = user.ToUserResponse()
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &model.UsersListResponse{
		Users:      userResponses,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// UpdateUser mengupdate data user
func (s *authService) UpdateUser(ctx context.Context, userID uuid.UUID, req *model.UpdateUserRequest) (*model.UserResponse, error) {
	// Cari user berdasarkan ID
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, ErrInternalServerError
	}

	// Update field yang diberikan
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Active != nil {
		user.Active = *req.Active
	}
	if req.Role != "" {
		user.Role = req.Role
	}

	user.UpdatedAt = time.Now()

	// Simpan perubahan
	err = s.userRepo.Update(ctx, user)
	if err != nil {
		return nil, ErrInternalServerError
	}

	// Hapus cache user
	s.tokenRepo.InvalidateUserCache(ctx, userID)

	userResponse := user.ToUserResponse()
	return &userResponse, nil
}

// GetUserStats mendapatkan statistik user
func (s *authService) GetUserStats(ctx context.Context) (*model.UserStats, error) {
	stats, err := s.userRepo.GetUserStats(ctx)
	if err != nil {
		return nil, ErrInternalServerError
	}

	return stats, nil
}

// GetUserActivity mendapatkan aktivitas user
func (s *authService) GetUserActivity(ctx context.Context, userID uuid.UUID, days int) ([]model.UserActivity, error) {
	// Verifikasi user exists
	_, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, ErrInternalServerError
	}

	activities, err := s.userRepo.GetUserActivity(ctx, userID, days)
	if err != nil {
		return nil, ErrInternalServerError
	}

	return activities, nil
}

func (s *authService) GetUserActivityResponse(ctx context.Context, userID uuid.UUID, days int) (*model.UserActivityResponse, error) {
	return s.userRepo.GetUserActivityResponse(ctx, userID, days)
}
