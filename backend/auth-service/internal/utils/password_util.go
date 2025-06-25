package utils

import (
	"crypto/rand"
	"math/big"
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

// secureRandom adalah generator angka acak yang aman untuk kriptografi
var secureRandom = rand.Reader

// HashPassword menghasilkan hash bcrypt dari password
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPasswordHash membandingkan password dengan hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// IsStrongPassword memeriksa apakah password cukup kuat
func IsStrongPassword(password string, minLength int) bool {
	if len(password) < minLength {
		return false
	}

	// Cek apakah password memiliki setidaknya satu huruf besar
	hasUppercase := regexp.MustCompile(`[A-Z]`).MatchString(password)
	if !hasUppercase {
		return false
	}

	// Cek apakah password memiliki setidaknya satu huruf kecil
	hasLowercase := regexp.MustCompile(`[a-z]`).MatchString(password)
	if !hasLowercase {
		return false
	}

	// Cek apakah password memiliki setidaknya satu angka
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	if !hasNumber {
		return false
	}

	// Cek apakah password memiliki setidaknya satu karakter khusus
	hasSpecial := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)
	if !hasSpecial {
		return false
	}

	return true
}

// GenerateRandomInt menghasilkan angka acak antara min dan max (inklusif)
func GenerateRandomInt(min, max int64) (int64, error) {
	if min > max {
		min, max = max, min
	}

	n, err := rand.Int(secureRandom, big.NewInt(max-min+1))
	if err != nil {
		return 0, err
	}

	return n.Int64() + min, nil
}