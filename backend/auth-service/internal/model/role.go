package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Role merepresentasikan role dalam sistem
type Role struct {
	ID          uuid.UUID      `gorm:"type:char(36);primary_key" json:"id"`
	Name        string         `gorm:"type:varchar(50);uniqueIndex" json:"name"`
	DisplayName string         `gorm:"type:varchar(100)" json:"display_name"`
	Description string         `gorm:"type:text" json:"description"`
	Active      bool           `gorm:"default:true" json:"active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
	Users       []User       `gorm:"foreignKey:RoleID" json:"users,omitempty"`
}

// Permission merepresentasikan permission dalam sistem
type Permission struct {
	ID          uuid.UUID      `gorm:"type:char(36);primary_key" json:"id"`
	Name        string         `gorm:"type:varchar(100);uniqueIndex" json:"name"`
	DisplayName string         `gorm:"type:varchar(100)" json:"display_name"`
	Description string         `gorm:"type:text" json:"description"`
	Resource    string         `gorm:"type:varchar(50)" json:"resource"` // users, roles, dashboard, etc.
	Action      string         `gorm:"type:varchar(50)" json:"action"`   // create, read, update, delete, list
	Active      bool           `gorm:"default:true" json:"active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Roles []Role `gorm:"many2many:role_permissions;" json:"roles,omitempty"`
}

// RolePermission adalah tabel pivot untuk many-to-many relationship
type RolePermission struct {
	RoleID       uuid.UUID `gorm:"type:char(36);primaryKey" json:"role_id"`
	PermissionID uuid.UUID `gorm:"type:char(36);primaryKey" json:"permission_id"`
	CreatedAt    time.Time `json:"created_at"`
}

// BeforeCreate hook untuk mengatur UUID sebelum menyimpan role baru
func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook untuk mengatur UUID sebelum menyimpan permission baru
func (p *Permission) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// RoleResponse adalah struktur untuk respons API role
type RoleResponse struct {
	ID          uuid.UUID            `json:"id"`
	Name        string               `json:"name"`
	DisplayName string               `json:"display_name"`
	Description string               `json:"description"`
	Active      bool                 `json:"active"`
	Permissions []PermissionResponse `json:"permissions,omitempty"`
	CreatedAt   time.Time            `json:"created_at"`
	UpdatedAt   time.Time            `json:"updated_at"`
}

// PermissionResponse adalah struktur untuk respons API permission
type PermissionResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	DisplayName string    `json:"display_name"`
	Description string    `json:"description"`
	Resource    string    `json:"resource"`
	Action      string    `json:"action"`
	Active      bool      `json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToRoleResponse mengkonversi Role ke RoleResponse
func (r *Role) ToRoleResponse() RoleResponse {
	permissions := make([]PermissionResponse, len(r.Permissions))
	for i, p := range r.Permissions {
		permissions[i] = p.ToPermissionResponse()
	}
	
	return RoleResponse{
		ID:          r.ID,
		Name:        r.Name,
		DisplayName: r.DisplayName,
		Description: r.Description,
		Active:      r.Active,
		Permissions: permissions,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}

// ToPermissionResponse mengkonversi Permission ke PermissionResponse
func (p *Permission) ToPermissionResponse() PermissionResponse {
	return PermissionResponse{
		ID:          p.ID,
		Name:        p.Name,
		DisplayName: p.DisplayName,
		Description: p.Description,
		Resource:    p.Resource,
		Action:      p.Action,
		Active:      p.Active,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

// CreateRoleRequest adalah struktur untuk request create role
type CreateRoleRequest struct {
	Name         string      `json:"name" validate:"required,min=2,max=50"`
	DisplayName  string      `json:"display_name" validate:"required,min=2,max=100"`
	Description  string      `json:"description" validate:"max=500"`
	Permissions  []uuid.UUID `json:"permissions" validate:"required"`
}

// UpdateRoleRequest adalah struktur untuk request update role
type UpdateRoleRequest struct {
	DisplayName *string     `json:"display_name" validate:"omitempty,min=2,max=100"`
	Description *string     `json:"description" validate:"omitempty,max=500"`
	Active      *bool       `json:"active"`
	Permissions []uuid.UUID `json:"permissions"`
}

// CreatePermissionRequest adalah struktur untuk request create permission
type CreatePermissionRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	DisplayName string `json:"display_name" validate:"required,min=2,max=100"`
	Description string `json:"description" validate:"max=500"`
	Resource    string `json:"resource" validate:"required,min=2,max=50"`
	Action      string `json:"action" validate:"required,oneof=create read update delete list manage"`
}

// UpdatePermissionRequest adalah struktur untuk request update permission
type UpdatePermissionRequest struct {
	DisplayName *string `json:"display_name" validate:"omitempty,min=2,max=100"`
	Description *string `json:"description" validate:"omitempty,max=500"`
	Resource    *string `json:"resource" validate:"omitempty,min=2,max=50"`
	Action      *string `json:"action" validate:"omitempty,oneof=create read update delete list manage"`
	Active      *bool   `json:"active"`
}

// RolesListResponse adalah struktur untuk response daftar role
type RolesListResponse struct {
	Roles      []RoleResponse `json:"roles"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"total_pages"`
}

// PermissionsListResponse adalah struktur untuk response daftar permission
type PermissionsListResponse struct {
	Permissions []PermissionResponse `json:"permissions"`
	Total       int64                `json:"total"`
	Page        int                  `json:"page"`
	Limit       int                  `json:"limit"`
	TotalPages  int                  `json:"total_pages"`
}