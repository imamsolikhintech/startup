package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/auth-service/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Repository errors
var (
	ErrRoleNotFound       = errors.New("role not found")
	ErrPermissionNotFound = errors.New("permission not found")
)

// RoleRepository interface untuk operasi database role
type RoleRepository interface {
	// Role CRUD operations
	GetAllRoles(ctx context.Context, offset, limit int, search string) ([]model.Role, int64, error)
	GetRoleByID(ctx context.Context, roleID uuid.UUID) (*model.Role, error)
	GetRoleByName(ctx context.Context, name string) (*model.Role, error)
	CreateRole(ctx context.Context, role *model.Role) (*model.Role, error)
	UpdateRole(ctx context.Context, role *model.Role) (*model.Role, error)
	DeleteRole(ctx context.Context, roleID uuid.UUID) error
	
	// Role-Permission operations
	AssignPermissionsToRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error
	RemovePermissionsFromRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error
	ReplaceRolePermissions(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error
	GetRolePermissions(ctx context.Context, roleID uuid.UUID) ([]model.Permission, error)
}

// PermissionRepository interface untuk operasi database permission
type PermissionRepository interface {
	// Permission CRUD operations
	GetAllPermissions(ctx context.Context, offset, limit int, search, resource string) ([]model.Permission, int64, error)
	GetPermissionByID(ctx context.Context, permissionID uuid.UUID) (*model.Permission, error)
	GetPermissionByName(ctx context.Context, name string) (*model.Permission, error)
	CreatePermission(ctx context.Context, permission *model.Permission) (*model.Permission, error)
	UpdatePermission(ctx context.Context, permission *model.Permission) (*model.Permission, error)
	DeletePermission(ctx context.Context, permissionID uuid.UUID) error
	
	// Utility operations
	GetPermissionsByIDs(ctx context.Context, permissionIDs []uuid.UUID) ([]model.Permission, error)
}

// roleRepository implementasi RoleRepository
type roleRepository struct {
	db *gorm.DB
}

// permissionRepository implementasi PermissionRepository
type permissionRepository struct {
	db *gorm.DB
}

// NewRoleRepository membuat instance baru RoleRepository
func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{db: db}
}

// NewPermissionRepository membuat instance baru PermissionRepository
func NewPermissionRepository(db *gorm.DB) PermissionRepository {
	return &permissionRepository{db: db}
}

// === Role Repository Implementation ===

// GetAllRoles mendapatkan semua role dengan pagination dan search
func (r *roleRepository) GetAllRoles(ctx context.Context, offset, limit int, search string) ([]model.Role, int64, error) {
	var roles []model.Role
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Role{}).Preload("Permissions")

	// Apply search filter
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(display_name) LIKE ? OR LOWER(description) LIKE ?", 
			searchPattern, searchPattern, searchPattern)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count roles: %w", err)
	}

	// Get paginated results
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&roles).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get roles: %w", err)
	}

	return roles, total, nil
}

// GetRoleByID mendapatkan role berdasarkan ID
func (r *roleRepository) GetRoleByID(ctx context.Context, roleID uuid.UUID) (*model.Role, error) {
	var role model.Role
	err := r.db.WithContext(ctx).Preload("Permissions").Where("id = ?", roleID).First(&role).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}
	return &role, nil
}

// GetRoleByName mendapatkan role berdasarkan nama
func (r *roleRepository) GetRoleByName(ctx context.Context, name string) (*model.Role, error) {
	var role model.Role
	err := r.db.WithContext(ctx).Preload("Permissions").Where("name = ?", name).First(&role).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}
	return &role, nil
}

// CreateRole membuat role baru
func (r *roleRepository) CreateRole(ctx context.Context, role *model.Role) (*model.Role, error) {
	err := r.db.WithContext(ctx).Create(role).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}
	return role, nil
}

// UpdateRole mengupdate role
func (r *roleRepository) UpdateRole(ctx context.Context, role *model.Role) (*model.Role, error) {
	err := r.db.WithContext(ctx).Save(role).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update role: %w", err)
	}
	return role, nil
}

// DeleteRole menghapus role
func (r *roleRepository) DeleteRole(ctx context.Context, roleID uuid.UUID) error {
	// Start transaction
	tx := r.db.WithContext(ctx).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Remove all role-permission associations
	if err := tx.Exec("DELETE FROM role_permissions WHERE role_id = ?", roleID).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove role permissions: %w", err)
	}

	// Delete the role
	if err := tx.Delete(&model.Role{}, "id = ?", roleID).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete role: %w", err)
	}

	return tx.Commit().Error
}

// AssignPermissionsToRole menambahkan permissions ke role
func (r *roleRepository) AssignPermissionsToRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error {
	if len(permissionIDs) == 0 {
		return nil
	}

	// Get role to ensure it exists
	var role model.Role
	if err := r.db.WithContext(ctx).Where("id = ?", roleID).First(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Get permissions to ensure they exist
	var permissions []model.Permission
	if err := r.db.WithContext(ctx).Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
		return fmt.Errorf("failed to get permissions: %w", err)
	}

	if len(permissions) != len(permissionIDs) {
		return errors.New("some permissions not found")
	}

	// Associate permissions with role
	if err := r.db.WithContext(ctx).Model(&role).Association("Permissions").Append(&permissions); err != nil {
		return fmt.Errorf("failed to assign permissions: %w", err)
	}

	return nil
}

// RemovePermissionsFromRole menghapus permissions dari role
func (r *roleRepository) RemovePermissionsFromRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error {
	if len(permissionIDs) == 0 {
		return nil
	}

	// Get role to ensure it exists
	var role model.Role
	if err := r.db.WithContext(ctx).Where("id = ?", roleID).First(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Get permissions to remove
	var permissions []model.Permission
	if err := r.db.WithContext(ctx).Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
		return fmt.Errorf("failed to get permissions: %w", err)
	}

	// Remove permissions from role
	if err := r.db.WithContext(ctx).Model(&role).Association("Permissions").Delete(&permissions); err != nil {
		return fmt.Errorf("failed to remove permissions: %w", err)
	}

	return nil
}

// ReplaceRolePermissions mengganti semua permissions role
func (r *roleRepository) ReplaceRolePermissions(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error {
	// Get role to ensure it exists
	var role model.Role
	if err := r.db.WithContext(ctx).Where("id = ?", roleID).First(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrRoleNotFound
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Get new permissions
	var permissions []model.Permission
	if len(permissionIDs) > 0 {
		if err := r.db.WithContext(ctx).Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
			return fmt.Errorf("failed to get permissions: %w", err)
		}

		if len(permissions) != len(permissionIDs) {
			return errors.New("some permissions not found")
		}
	}

	// Replace all permissions
	if err := r.db.WithContext(ctx).Model(&role).Association("Permissions").Replace(&permissions); err != nil {
		return fmt.Errorf("failed to replace permissions: %w", err)
	}

	return nil
}

// GetRolePermissions mendapatkan permissions dari role
func (r *roleRepository) GetRolePermissions(ctx context.Context, roleID uuid.UUID) ([]model.Permission, error) {
	var role model.Role
	err := r.db.WithContext(ctx).Preload("Permissions").Where("id = ?", roleID).First(&role).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}
	return role.Permissions, nil
}

// === Permission Repository Implementation ===

// GetAllPermissions mendapatkan semua permission dengan pagination dan search
func (p *permissionRepository) GetAllPermissions(ctx context.Context, offset, limit int, search, resource string) ([]model.Permission, int64, error) {
	var permissions []model.Permission
	var total int64

	query := p.db.WithContext(ctx).Model(&model.Permission{})

	// Apply search filter
	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(display_name) LIKE ? OR LOWER(description) LIKE ?", 
			searchPattern, searchPattern, searchPattern)
	}

	// Apply resource filter
	if resource != "" {
		query = query.Where("resource = ?", resource)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count permissions: %w", err)
	}

	// Get paginated results
	if err := query.Offset(offset).Limit(limit).Order("resource ASC, action ASC").Find(&permissions).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get permissions: %w", err)
	}

	return permissions, total, nil
}

// GetPermissionByID mendapatkan permission berdasarkan ID
func (p *permissionRepository) GetPermissionByID(ctx context.Context, permissionID uuid.UUID) (*model.Permission, error) {
	var permission model.Permission
	err := p.db.WithContext(ctx).Where("id = ?", permissionID).First(&permission).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, fmt.Errorf("failed to get permission: %w", err)
	}
	return &permission, nil
}

// GetPermissionByName mendapatkan permission berdasarkan nama
func (p *permissionRepository) GetPermissionByName(ctx context.Context, name string) (*model.Permission, error) {
	var permission model.Permission
	err := p.db.WithContext(ctx).Where("name = ?", name).First(&permission).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPermissionNotFound
		}
		return nil, fmt.Errorf("failed to get permission: %w", err)
	}
	return &permission, nil
}

// CreatePermission membuat permission baru
func (p *permissionRepository) CreatePermission(ctx context.Context, permission *model.Permission) (*model.Permission, error) {
	err := p.db.WithContext(ctx).Create(permission).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create permission: %w", err)
	}
	return permission, nil
}

// UpdatePermission mengupdate permission
func (p *permissionRepository) UpdatePermission(ctx context.Context, permission *model.Permission) (*model.Permission, error) {
	err := p.db.WithContext(ctx).Save(permission).Error
	if err != nil {
		return nil, fmt.Errorf("failed to update permission: %w", err)
	}
	return permission, nil
}

// DeletePermission menghapus permission
func (p *permissionRepository) DeletePermission(ctx context.Context, permissionID uuid.UUID) error {
	// Start transaction
	tx := p.db.WithContext(ctx).Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Remove all role-permission associations
	if err := tx.Exec("DELETE FROM role_permissions WHERE permission_id = ?", permissionID).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove permission associations: %w", err)
	}

	// Delete the permission
	if err := tx.Delete(&model.Permission{}, "id = ?", permissionID).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete permission: %w", err)
	}

	return tx.Commit().Error
}

// GetPermissionsByIDs mendapatkan permissions berdasarkan IDs
func (p *permissionRepository) GetPermissionsByIDs(ctx context.Context, permissionIDs []uuid.UUID) ([]model.Permission, error) {
	var permissions []model.Permission
	err := p.db.WithContext(ctx).Where("id IN ?", permissionIDs).Find(&permissions).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get permissions: %w", err)
	}
	return permissions, nil
}