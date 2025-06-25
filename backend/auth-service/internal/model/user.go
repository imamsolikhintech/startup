package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User merepresentasikan model pengguna dalam sistem
type User struct {
	ID             uuid.UUID      `gorm:"type:char(36);primary_key" json:"id"`
	Email          string         `gorm:"type:varchar(255);uniqueIndex" json:"email"`
	Password       string         `gorm:"type:varchar(255)" json:"-"`
	Name           string         `gorm:"type:varchar(255)" json:"name"`
	ProfilePicture string         `gorm:"type:varchar(255)" json:"profile_picture"`
	Provider       string         `gorm:"type:varchar(50);default:'local'" json:"provider"` // local, google, etc.
	ProviderID     string         `gorm:"type:varchar(255)" json:"provider_id"`
	Role           string         `gorm:"type:varchar(50);default:'user'" json:"role"` // user, admin - legacy field
	RoleID         *uuid.UUID     `gorm:"type:char(36);index" json:"role_id"` // New role system
	Verified       bool           `gorm:"default:false" json:"verified"`
	Active         bool           `gorm:"default:true" json:"active"`
	LastLogin      *time.Time     `json:"last_login"`
	LoginAttempts  int            `gorm:"default:0" json:"-"`
	LockedUntil    *time.Time     `json:"-"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	UserRole     *Role          `gorm:"foreignKey:RoleID" json:"user_role,omitempty"`
	LoginHistory []LoginHistory `gorm:"foreignKey:UserID" json:"login_history,omitempty"`
}

// LoginHistory menyimpan riwayat login pengguna
type LoginHistory struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       uuid.UUID      `gorm:"type:char(36);index" json:"user_id"`
	IP           string         `gorm:"type:varchar(50)" json:"ip"`
	UserAgent    string         `gorm:"type:varchar(255)" json:"user_agent"`
	DeviceInfo   string         `gorm:"type:varchar(255)" json:"device_info"`
	Browser      string         `gorm:"type:varchar(100)" json:"browser"`
	OS           string         `gorm:"type:varchar(100)" json:"os"`
	Country      string         `gorm:"type:varchar(100)" json:"country"`
	City         string         `gorm:"type:varchar(100)" json:"city"`
	Success      bool           `gorm:"default:true" json:"success"`
	FailureReason string         `gorm:"type:varchar(255)" json:"failure_reason"`
	LoginTime    time.Time      `json:"login_time"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate hook untuk mengatur UUID sebelum menyimpan user baru
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// UserResponse adalah struktur untuk respons API user tanpa data sensitif
type UserResponse struct {
	ID             uuid.UUID        `json:"id"`
	Email          string           `json:"email"`
	Name           string           `json:"name"`
	ProfilePicture string           `json:"profile_picture"`
	Provider       string           `json:"provider"`
	Role           string           `json:"role"` // Legacy field
	RoleID         *uuid.UUID       `json:"role_id"`
	UserRole       *RoleResponse    `json:"user_role,omitempty"`
	Permissions    []string         `json:"permissions,omitempty"` // Flattened permissions for easy access
	Verified       bool             `json:"verified"`
	Active         bool             `json:"active"`
	LastLogin      time.Time        `json:"last_login,omitempty"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
}

// ToUserResponse mengkonversi User ke UserResponse
func (u *User) ToUserResponse() UserResponse {
	var lastLogin time.Time
	if u.LastLogin != nil {
		lastLogin = *u.LastLogin
	}

	response := UserResponse{
		ID:             u.ID,
		Email:          u.Email,
		Name:           u.Name,
		ProfilePicture: u.ProfilePicture,
		Provider:       u.Provider,
		Role:           u.Role, // Legacy field
		RoleID:         u.RoleID,
		Verified:       u.Verified,
		Active:         u.Active,
		LastLogin:      lastLogin,
		CreatedAt:      u.CreatedAt,
		UpdatedAt:      u.UpdatedAt,
	}

	// Add role information if available
	if u.UserRole != nil {
		roleResponse := u.UserRole.ToRoleResponse()
		response.UserRole = &roleResponse
		
		// Flatten permissions for easy access
		permissions := make([]string, len(u.UserRole.Permissions))
		for i, p := range u.UserRole.Permissions {
			permissions[i] = p.Name
		}
		response.Permissions = permissions
	}

	return response
}

// RegisterRequest adalah struktur untuk request registrasi
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Name     string `json:"name" validate:"required"`
}

// LoginRequest adalah struktur untuk request login
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RefreshTokenRequest adalah struktur untuk request refresh token
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// TokenResponse adalah struktur untuk response token
type TokenResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int64        `json:"expires_in"` // dalam detik
	TokenType    string       `json:"token_type"`
	User         UserResponse `json:"user"`
}

// LogoutRequest adalah struktur untuk request logout
type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// UserStats adalah struktur untuk statistik user
type UserStats struct {
	TotalUsers        int64 `json:"total_users"`
	ActiveUsers       int64 `json:"active_users"`
	VerifiedUsers     int64 `json:"verified_users"`
	NewUsersToday     int64 `json:"new_users_today"`
	NewUsersThisWeek  int64 `json:"new_users_this_week"`
	NewUsersThisMonth int64 `json:"new_users_this_month"`
}

// UserActivity adalah struktur untuk aktivitas user harian
type UserActivity struct {
	Date       time.Time `json:"date"`
	LoginCount int       `json:"login_count"`
	UniqueIPs  int       `json:"unique_ips"`
}

// UserActivityResponse adalah struktur lengkap untuk response aktivitas user
type UserActivityResponse struct {
	ActivityLog    []UserActivity    `json:"activity_log"`
	LoginSessions  []LoginSession    `json:"login_sessions"`
	Statistics     ActivityStats     `json:"statistics"`
}

// LoginSession adalah struktur untuk sesi login individual
type LoginSession struct {
	ID           uint      `json:"id"`
	Timestamp    time.Time `json:"timestamp"`
	IPAddress    string    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	DeviceInfo   string    `json:"device_info"`
	Browser      string    `json:"browser"`
	OS           string    `json:"os"`
	Location     string    `json:"location"`
	Success      bool      `json:"success"`
}

// ActivityStats adalah struktur untuk statistik aktivitas
type ActivityStats struct {
	TotalLogins     int       `json:"total_logins"`
	TotalDays       int       `json:"total_days"`
	UniqueIPs       int       `json:"unique_ips"`
	LastLogin       *time.Time `json:"last_login"`
	MostActiveDay   string    `json:"most_active_day"`
	AveragePerDay   float64   `json:"average_per_day"`
}

// UpdateUserRequest adalah struktur untuk request update user
type UpdateUserRequest struct {
	Name   string     `json:"name" validate:"omitempty,min=1"`
	Active *bool      `json:"active" validate:"omitempty"`
	Role   string     `json:"role" validate:"omitempty,oneof=user admin"` // Legacy field
	RoleID *uuid.UUID `json:"role_id" validate:"omitempty"` // New role system
}

// UsersListResponse adalah struktur untuk response daftar user
type UsersListResponse struct {
	Users      []UserResponse `json:"users"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"total_pages"`
}