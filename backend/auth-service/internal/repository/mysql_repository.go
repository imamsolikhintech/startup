package repository

import (
	"context"
	"errors"
	"time"

	"github.com/auth-service/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Errors
var (
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrDatabaseError      = errors.New("database error")
)

// UserRepository interface untuk operasi database user
type UserRepository interface {
	Create(ctx context.Context, user *model.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*model.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error)
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindByProviderID(ctx context.Context, provider, providerID string) (*model.User, error)
	Update(ctx context.Context, user *model.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	UpdateLastLogin(ctx context.Context, userID uuid.UUID, loginTime time.Time) error
	IncrementLoginAttempts(ctx context.Context, userID uuid.UUID) error
	ResetLoginAttempts(ctx context.Context, userID uuid.UUID) error
	LockAccount(ctx context.Context, userID uuid.UUID, duration time.Duration) error
	SaveLoginHistory(ctx context.Context, history *model.LoginHistory) error
	GetLoginHistory(ctx context.Context, userID uuid.UUID, limit int) ([]model.LoginHistory, error)
	// User Management methods
	GetAllUsers(ctx context.Context, offset, limit int, search string) ([]model.User, int64, error)
	UpdateUserStatus(ctx context.Context, userID uuid.UUID, active bool) error
	UpdateUserRole(ctx context.Context, userID uuid.UUID, role string) error
	GetUserStats(ctx context.Context) (*model.UserStats, error)
	GetUserActivity(ctx context.Context, userID uuid.UUID, days int) ([]model.UserActivity, error)
	GetUserActivityResponse(ctx context.Context, userID uuid.UUID, days int) (*model.UserActivityResponse, error)
	GetLoginSessions(ctx context.Context, userID uuid.UUID, days int) ([]model.LoginSession, error)
	GetActivityStatistics(ctx context.Context, userID uuid.UUID, days int) (*model.ActivityStats, error)
	// Role-related methods
	CountUsersByRoleID(ctx context.Context, roleID uuid.UUID) (int64, error)
}

// MySQLUserRepository implementasi UserRepository menggunakan MySQL
type MySQLUserRepository struct {
	db *gorm.DB
}

// NewMySQLUserRepository membuat instance baru MySQLUserRepository
func NewMySQLUserRepository(db *gorm.DB) UserRepository {
	return &MySQLUserRepository{db: db}
}

// Create menyimpan user baru ke database
func (r *MySQLUserRepository) Create(ctx context.Context, user *model.User) error {
	// Cek apakah email sudah ada
	var count int64
	if err := r.db.Model(&model.User{}).Where("email = ?", user.Email).Count(&count).Error; err != nil {
		return ErrDatabaseError
	}

	if count > 0 {
		return ErrEmailAlreadyExists
	}

	result := r.db.WithContext(ctx).Create(user)
	if result.Error != nil {
		return ErrDatabaseError
	}

	return nil
}

// FindByID mencari user berdasarkan ID
func (r *MySQLUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var user model.User
	result := r.db.WithContext(ctx).Preload("LoginHistory", func(db *gorm.DB) *gorm.DB {
		return db.Order("login_time DESC").Limit(5)
	}).First(&user, "id = ?", id)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, ErrDatabaseError
	}

	return &user, nil
}

// GetUserByID alias untuk FindByID untuk kompatibilitas dengan role service
func (r *MySQLUserRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	return r.FindByID(ctx, id)
}

// FindByEmail mencari user berdasarkan email
func (r *MySQLUserRepository) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	result := r.db.WithContext(ctx).Where("email = ?", email).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, ErrDatabaseError
	}

	return &user, nil
}

// FindByProviderID mencari user berdasarkan provider dan provider ID (untuk OAuth)
func (r *MySQLUserRepository) FindByProviderID(ctx context.Context, provider, providerID string) (*model.User, error) {
	var user model.User
	result := r.db.WithContext(ctx).Where("provider = ? AND provider_id = ?", provider, providerID).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, ErrDatabaseError
	}

	return &user, nil
}

// Update memperbarui data user
func (r *MySQLUserRepository) Update(ctx context.Context, user *model.User) error {
	result := r.db.WithContext(ctx).Save(user)
	if result.Error != nil {
		return ErrDatabaseError
	}

	return nil
}

// Delete menghapus user (soft delete)
func (r *MySQLUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&model.User{}, "id = ?", id)
	if result.Error != nil {
		return ErrDatabaseError
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// UpdateLastLogin memperbarui waktu login terakhir
func (r *MySQLUserRepository) UpdateLastLogin(ctx context.Context, userID uuid.UUID, loginTime time.Time) error {
	result := r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("last_login", loginTime)
	if result.Error != nil {
		return ErrDatabaseError
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// IncrementLoginAttempts menambah jumlah percobaan login yang gagal
func (r *MySQLUserRepository) IncrementLoginAttempts(ctx context.Context, userID uuid.UUID) error {
	result := r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("login_attempts", gorm.Expr("login_attempts + 1"))
	if result.Error != nil {
		return ErrDatabaseError
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// ResetLoginAttempts mengatur ulang jumlah percobaan login
func (r *MySQLUserRepository) ResetLoginAttempts(ctx context.Context, userID uuid.UUID) error {
	result := r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("login_attempts", 0)
	if result.Error != nil {
		return ErrDatabaseError
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// LockAccount mengunci akun user untuk durasi tertentu
func (r *MySQLUserRepository) LockAccount(ctx context.Context, userID uuid.UUID, duration time.Duration) error {
	lockUntil := time.Now().Add(duration)
	result := r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("locked_until", lockUntil)
	if result.Error != nil {
		return ErrDatabaseError
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// SaveLoginHistory menyimpan riwayat login
func (r *MySQLUserRepository) SaveLoginHistory(ctx context.Context, history *model.LoginHistory) error {
	result := r.db.WithContext(ctx).Create(history)
	if result.Error != nil {
		return ErrDatabaseError
	}

	return nil
}

// GetLoginHistory mendapatkan riwayat login user
func (r *MySQLUserRepository) GetLoginHistory(ctx context.Context, userID uuid.UUID, limit int) ([]model.LoginHistory, error) {
	var histories []model.LoginHistory

	if limit <= 0 {
		limit = 10 // Default limit
	}

	result := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("login_time DESC").Limit(limit).Find(&histories)
	if result.Error != nil {
		return nil, ErrDatabaseError
	}

	return histories, nil
}

// GetAllUsers mendapatkan semua user dengan pagination dan pencarian
func (r *MySQLUserRepository) GetAllUsers(ctx context.Context, offset, limit int, search string) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	query := r.db.WithContext(ctx).Model(&model.User{})

	// Jika ada parameter pencarian
	if search != "" {
		query = query.Where("email LIKE ? OR name LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Hitung total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, ErrDatabaseError
	}

	// Ambil data dengan pagination
	result := query.Preload("LoginHistory", func(db *gorm.DB) *gorm.DB {
		return db.Order("login_time DESC").Limit(1)
	}).Order("created_at DESC").Offset(offset).Limit(limit).Find(&users)

	if result.Error != nil {
		return nil, 0, ErrDatabaseError
	}

	return users, total, nil
}

// UpdateUserStatus mengupdate status aktif user
func (r *MySQLUserRepository) UpdateUserStatus(ctx context.Context, userID uuid.UUID, active bool) error {
	result := r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("active", active)
	if result.Error != nil {
		return ErrDatabaseError
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// UpdateUserRole mengupdate role user
func (r *MySQLUserRepository) UpdateUserRole(ctx context.Context, userID uuid.UUID, role string) error {
	result := r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("role", role)
	if result.Error != nil {
		return ErrDatabaseError
	}

	if result.RowsAffected == 0 {
		return ErrUserNotFound
	}

	return nil
}

// GetUserStats mendapatkan statistik user
func (r *MySQLUserRepository) GetUserStats(ctx context.Context) (*model.UserStats, error) {
	stats := &model.UserStats{}

	// Total users
	if err := r.db.WithContext(ctx).Model(&model.User{}).Count(&stats.TotalUsers).Error; err != nil {
		return nil, ErrDatabaseError
	}

	// Active users
	if err := r.db.WithContext(ctx).Model(&model.User{}).Where("active = ?", true).Count(&stats.ActiveUsers).Error; err != nil {
		return nil, ErrDatabaseError
	}

	// Verified users
	if err := r.db.WithContext(ctx).Model(&model.User{}).Where("verified = ?", true).Count(&stats.VerifiedUsers).Error; err != nil {
		return nil, ErrDatabaseError
	}

	// Users registered today
	today := time.Now().Truncate(24 * time.Hour)
	if err := r.db.WithContext(ctx).Model(&model.User{}).Where("created_at >= ?", today).Count(&stats.NewUsersToday).Error; err != nil {
		return nil, ErrDatabaseError
	}

	// Users registered this week
	weekAgo := time.Now().AddDate(0, 0, -7)
	if err := r.db.WithContext(ctx).Model(&model.User{}).Where("created_at >= ?", weekAgo).Count(&stats.NewUsersThisWeek).Error; err != nil {
		return nil, ErrDatabaseError
	}

	// Users registered this month
	monthAgo := time.Now().AddDate(0, -1, 0)
	if err := r.db.WithContext(ctx).Model(&model.User{}).Where("created_at >= ?", monthAgo).Count(&stats.NewUsersThisMonth).Error; err != nil {
		return nil, ErrDatabaseError
	}

	return stats, nil
}

// GetUserActivity mendapatkan aktivitas user dalam beberapa hari terakhir
func (r *MySQLUserRepository) GetUserActivity(ctx context.Context, userID uuid.UUID, days int) ([]model.UserActivity, error) {
	var activities []model.UserActivity

	if days <= 0 {
		days = 30 // Default 30 hari
	}

	startDate := time.Now().AddDate(0, 0, -days)

	// Query untuk mendapatkan aktivitas login per hari
	query := `
		SELECT 
			DATE(login_time) as date,
			COUNT(*) as login_count,
			COUNT(DISTINCT ip) as unique_ips
		FROM login_histories 
		WHERE user_id = ? AND login_time >= ? AND success = true
		GROUP BY DATE(login_time)
		ORDER BY date DESC
	`

	rows, err := r.db.Debug().WithContext(ctx).Raw(query, userID, startDate).Rows()
	if err != nil {
		return nil, ErrDatabaseError
	}
	defer rows.Close()

	for rows.Next() {
		var activity model.UserActivity
		if err := rows.Scan(&activity.Date, &activity.LoginCount, &activity.UniqueIPs); err != nil {
			return nil, ErrDatabaseError
		}
		activities = append(activities, activity)
	}

	return activities, nil
}

// GetUserActivityResponse mendapatkan response lengkap aktivitas user
func (r *MySQLUserRepository) GetUserActivityResponse(ctx context.Context, userID uuid.UUID, days int) (*model.UserActivityResponse, error) {
	// Get activity log
	activityLog, err := r.GetUserActivity(ctx, userID, days)
	if err != nil {
		return nil, err
	}

	// Get login sessions
	loginSessions, err := r.GetLoginSessions(ctx, userID, days)
	if err != nil {
		return nil, err
	}

	// Get statistics
	statistics, err := r.GetActivityStatistics(ctx, userID, days)
	if err != nil {
		return nil, err
	}

	return &model.UserActivityResponse{
		ActivityLog:   activityLog,
		LoginSessions: loginSessions,
		Statistics:    *statistics,
	}, nil
}

// GetLoginSessions mendapatkan sesi login individual
func (r *MySQLUserRepository) GetLoginSessions(ctx context.Context, userID uuid.UUID, days int) ([]model.LoginSession, error) {
	var sessions []model.LoginSession

	if days <= 0 {
		days = 30
	}

	startDate := time.Now().AddDate(0, 0, -days)

	// Query untuk mendapatkan sesi login individual
	var loginHistories []model.LoginHistory
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND login_time >= ?", userID, startDate).
		Order("login_time DESC").
		Limit(100). // Batasi untuk performa
		Find(&loginHistories).Error

	if err != nil {
		return nil, ErrDatabaseError
	}

	// Convert ke LoginSession format
	for _, history := range loginHistories {
		location := ""
		if history.City != "" && history.Country != "" {
			location = history.City + ", " + history.Country
		} else if history.Country != "" {
			location = history.Country
		}

		sessions = append(sessions, model.LoginSession{
			ID:         history.ID,
			Timestamp:  history.LoginTime,
			IPAddress:  history.IP,
			UserAgent:  history.UserAgent,
			DeviceInfo: history.DeviceInfo,
			Browser:    history.Browser,
			OS:         history.OS,
			Location:   location,
			Success:    history.Success,
		})
	}

	return sessions, nil
}

// GetActivityStatistics mendapatkan statistik aktivitas
func (r *MySQLUserRepository) GetActivityStatistics(ctx context.Context, userID uuid.UUID, days int) (*model.ActivityStats, error) {
	if days <= 0 {
		days = 30
	}

	startDate := time.Now().AddDate(0, 0, -days)

	// Get total logins
	var totalLogins int64
	err := r.db.WithContext(ctx).
		Model(&model.LoginHistory{}).
		Where("user_id = ? AND login_time >= ? AND success = true", userID, startDate).
		Count(&totalLogins).Error
	if err != nil {
		return nil, ErrDatabaseError
	}

	// Get unique IPs
	var uniqueIPs int64
	err = r.db.WithContext(ctx).
		Model(&model.LoginHistory{}).
		Select("COUNT(DISTINCT ip)").
		Where("user_id = ? AND login_time >= ? AND success = true", userID, startDate).
		Scan(&uniqueIPs).Error
	if err != nil {
		return nil, ErrDatabaseError
	}

	// Get total days with activity
	var totalDays int64
	err = r.db.WithContext(ctx).
		Model(&model.LoginHistory{}).
		Select("COUNT(DISTINCT DATE(login_time))").
		Where("user_id = ? AND login_time >= ? AND success = true", userID, startDate).
		Scan(&totalDays).Error
	if err != nil {
		return nil, ErrDatabaseError
	}

	// Get last login
	var lastLogin *time.Time
	var loginHistory model.LoginHistory
	err = r.db.WithContext(ctx).
		Where("user_id = ? AND success = true", userID).
		Order("login_time DESC").
		First(&loginHistory).Error
	if err == nil {
		lastLogin = &loginHistory.LoginTime
	}

	// Get most active day
	var mostActiveDay string
	var dayResult struct {
		Day   string
		Count int64
	}
	err = r.db.WithContext(ctx).
		Model(&model.LoginHistory{}).
		Select("DAYNAME(login_time) as day, COUNT(*) as count").
		Where("user_id = ? AND login_time >= ? AND success = true", userID, startDate).
		Group("DAYNAME(login_time)").
		Order("count DESC").
		First(&dayResult).Error
	if err == nil {
		mostActiveDay = dayResult.Day
	}

	// Calculate average per day
	averagePerDay := float64(0)
	if totalDays > 0 {
		averagePerDay = float64(totalLogins) / float64(totalDays)
	}

	return &model.ActivityStats{
		TotalLogins:   int(totalLogins),
		TotalDays:     int(totalDays),
		UniqueIPs:     int(uniqueIPs),
		LastLogin:     lastLogin,
		MostActiveDay: mostActiveDay,
		AveragePerDay: averagePerDay,
	}, nil
}

// CountUsersByRoleID menghitung jumlah user berdasarkan role ID
func (r *MySQLUserRepository) CountUsersByRoleID(ctx context.Context, roleID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("role_id = ?", roleID).Count(&count).Error
	if err != nil {
		return 0, ErrDatabaseError
	}
	return count, nil
}
