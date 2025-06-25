package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/auth-service/internal/model"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

// Errors
var (
	ErrRedisError     = errors.New("redis error")
	ErrTokenNotFound  = errors.New("token not found")
	ErrTokenRevoked   = errors.New("token has been revoked")
	ErrTokenExpired   = errors.New("token has expired")
	ErrRateLimitExceeded = errors.New("rate limit exceeded")
)

// TokenRepository interface untuk operasi token
type TokenRepository interface {
	StoreRefreshToken(ctx context.Context, userID uuid.UUID, tokenID string, expiresIn time.Duration) error
	ValidateRefreshToken(ctx context.Context, userID uuid.UUID, tokenID string) error
	RevokeRefreshToken(ctx context.Context, userID uuid.UUID, tokenID string) error
	RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error
	StoreUserSession(ctx context.Context, userID uuid.UUID, sessionData interface{}, expiresIn time.Duration) error
	GetUserSession(ctx context.Context, userID uuid.UUID) (string, error)
	DeleteUserSession(ctx context.Context, userID uuid.UUID) error
	StoreOAuthState(ctx context.Context, state string, sessionData map[string]string, expiresIn time.Duration) error
	GetOAuthState(ctx context.Context, state string) (map[string]string, error)
	CheckRateLimit(ctx context.Context, key string, limit int, duration time.Duration) (bool, error)
	CacheUserData(ctx context.Context, userID uuid.UUID, userData *model.UserResponse, duration time.Duration) error
	GetCachedUserData(ctx context.Context, userID uuid.UUID) (*model.UserResponse, error)
	InvalidateUserCache(ctx context.Context, userID uuid.UUID) error
}

// RedisTokenRepository implementasi TokenRepository menggunakan Redis
type RedisTokenRepository struct {
	redisClient *redis.Client
}

// NewRedisTokenRepository membuat instance baru RedisTokenRepository
func NewRedisTokenRepository(redisClient *redis.Client) TokenRepository {
	return &RedisTokenRepository{redisClient: redisClient}
}

// GetRedisClient mengembalikan Redis client untuk akses langsung
func (r *RedisTokenRepository) GetRedisClient() *redis.Client {
	return r.redisClient
}

// StoreRefreshToken menyimpan refresh token ke Redis
func (r *RedisTokenRepository) StoreRefreshToken(ctx context.Context, userID uuid.UUID, tokenID string, expiresIn time.Duration) error {
	key := fmt.Sprintf("refresh_token:%s:%s", userID.String(), tokenID)
	status := "valid"

	err := r.redisClient.Set(ctx, key, status, expiresIn).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	// Tambahkan token ke set token pengguna untuk memudahkan pencabutan semua token
	userTokensKey := fmt.Sprintf("user_tokens:%s", userID.String())
	err = r.redisClient.SAdd(ctx, userTokensKey, tokenID).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// ValidateRefreshToken memvalidasi refresh token
func (r *RedisTokenRepository) ValidateRefreshToken(ctx context.Context, userID uuid.UUID, tokenID string) error {
	key := fmt.Sprintf("refresh_token:%s:%s", userID.String(), tokenID)

	status, err := r.redisClient.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return ErrTokenNotFound
		}
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	if status != "valid" {
		return ErrTokenRevoked
	}

	return nil
}

// RevokeRefreshToken mencabut refresh token
func (r *RedisTokenRepository) RevokeRefreshToken(ctx context.Context, userID uuid.UUID, tokenID string) error {
	key := fmt.Sprintf("refresh_token:%s:%s", userID.String(), tokenID)

	// Periksa apakah token ada
	exists, err := r.redisClient.Exists(ctx, key).Result()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	if exists == 0 {
		return ErrTokenNotFound
	}

	// Ubah status token menjadi "revoked"
	err = r.redisClient.Set(ctx, key, "revoked", 0).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	// Hapus token dari set token pengguna
	userTokensKey := fmt.Sprintf("user_tokens:%s", userID.String())
	err = r.redisClient.SRem(ctx, userTokensKey, tokenID).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// RevokeAllUserTokens mencabut semua token pengguna
func (r *RedisTokenRepository) RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error {
	userTokensKey := fmt.Sprintf("user_tokens:%s", userID.String())

	// Dapatkan semua token ID pengguna
	tokenIDs, err := r.redisClient.SMembers(ctx, userTokensKey).Result()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	// Cabut setiap token
	for _, tokenID := range tokenIDs {
		key := fmt.Sprintf("refresh_token:%s:%s", userID.String(), tokenID)
		err = r.redisClient.Set(ctx, key, "revoked", 0).Err()
		if err != nil {
			return fmt.Errorf("%w: %v", ErrRedisError, err)
		}
	}

	// Hapus set token pengguna
	err = r.redisClient.Del(ctx, userTokensKey).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// StoreUserSession menyimpan data sesi pengguna
func (r *RedisTokenRepository) StoreUserSession(ctx context.Context, userID uuid.UUID, sessionData interface{}, expiresIn time.Duration) error {
	key := fmt.Sprintf("user_session:%s", userID.String())

	// Konversi data sesi ke JSON
	sessionJSON, err := json.Marshal(sessionData)
	if err != nil {
		return fmt.Errorf("failed to marshal session data: %v", err)
	}

	// Simpan data sesi
	err = r.redisClient.Set(ctx, key, sessionJSON, expiresIn).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// GetUserSession mendapatkan data sesi pengguna
func (r *RedisTokenRepository) GetUserSession(ctx context.Context, userID uuid.UUID) (string, error) {
	key := fmt.Sprintf("user_session:%s", userID.String())

	sessionJSON, err := r.redisClient.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", ErrTokenNotFound
		}
		return "", fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return sessionJSON, nil
}

// DeleteUserSession menghapus sesi pengguna
func (r *RedisTokenRepository) DeleteUserSession(ctx context.Context, userID uuid.UUID) error {
	key := fmt.Sprintf("user_session:%s", userID.String())

	// Hapus sesi pengguna
	err := r.redisClient.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// CheckRateLimit memeriksa rate limit
func (r *RedisTokenRepository) CheckRateLimit(ctx context.Context, key string, limit int, duration time.Duration) (bool, error) {
	key = fmt.Sprintf("rate_limit:%s", key)

	// Dapatkan jumlah permintaan saat ini
	count, err := r.redisClient.Get(ctx, key).Int()
	if err != nil && err != redis.Nil {
		return false, fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	// Jika kunci tidak ada, buat kunci baru dengan nilai 1
	if err == redis.Nil {
		err = r.redisClient.Set(ctx, key, 1, duration).Err()
		if err != nil {
			return false, fmt.Errorf("%w: %v", ErrRedisError, err)
		}
		return true, nil
	}

	// Jika jumlah permintaan melebihi batas, kembalikan error
	if count >= limit {
		return false, ErrRateLimitExceeded
	}

	// Tambahkan jumlah permintaan
	_, err = r.redisClient.Incr(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return true, nil
}

// CacheUserData menyimpan data pengguna ke cache
func (r *RedisTokenRepository) CacheUserData(ctx context.Context, userID uuid.UUID, userData *model.UserResponse, duration time.Duration) error {
	key := fmt.Sprintf("user_data:%s", userID.String())

	// Konversi data pengguna ke JSON
	userJSON, err := json.Marshal(userData)
	if err != nil {
		return fmt.Errorf("failed to marshal user data: %v", err)
	}

	// Simpan data pengguna
	err = r.redisClient.Set(ctx, key, userJSON, duration).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// GetCachedUserData mendapatkan data pengguna dari cache
func (r *RedisTokenRepository) GetCachedUserData(ctx context.Context, userID uuid.UUID) (*model.UserResponse, error) {
	key := fmt.Sprintf("user_data:%s", userID.String())

	userJSON, err := r.redisClient.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, ErrTokenNotFound
		}
		return nil, fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	// Parse JSON ke struct UserResponse
	var userData model.UserResponse
	err = json.Unmarshal([]byte(userJSON), &userData)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal user data: %v", err)
	}

	return &userData, nil
}

// InvalidateUserCache menghapus cache data pengguna
func (r *RedisTokenRepository) InvalidateUserCache(ctx context.Context, userID uuid.UUID) error {
	key := fmt.Sprintf("user_data:%s", userID.String())

	// Hapus cache data pengguna
	err := r.redisClient.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// StoreOAuthState menyimpan state OAuth ke Redis
func (r *RedisTokenRepository) StoreOAuthState(ctx context.Context, state string, sessionData map[string]string, expiresIn time.Duration) error {
	key := fmt.Sprintf("oauth_state:%s", state)

	// Konversi session data ke JSON
	sessionJSON, err := json.Marshal(sessionData)
	if err != nil {
		return fmt.Errorf("failed to marshal session data: %v", err)
	}

	// Simpan state OAuth
	err = r.redisClient.Set(ctx, key, sessionJSON, expiresIn).Err()
	if err != nil {
		return fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	return nil
}

// GetOAuthState mendapatkan state OAuth dari Redis
func (r *RedisTokenRepository) GetOAuthState(ctx context.Context, state string) (map[string]string, error) {
	key := fmt.Sprintf("oauth_state:%s", state)

	sessionJSON, err := r.redisClient.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, ErrTokenNotFound
		}
		return nil, fmt.Errorf("%w: %v", ErrRedisError, err)
	}

	// Parse JSON ke map[string]string
	var sessionData map[string]string
	err = json.Unmarshal([]byte(sessionJSON), &sessionData)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal session data: %v", err)
	}

	// Hapus state setelah digunakan (one-time use)
	err = r.redisClient.Del(ctx, key).Err()
	if err != nil {
		log.Printf("Failed to delete OAuth state: %v", err)
	}

	return sessionData, nil
}