package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/auth-service/internal/model"
	"github.com/auth-service/internal/repository"
	"github.com/google/uuid"
)

// Role and Permission related errors
var (
	ErrRoleNotFound            = errors.New("role not found")
	ErrRoleAlreadyExists       = errors.New("role already exists")
	ErrRoleInUse               = errors.New("role is currently in use")
	ErrPermissionNotFound      = errors.New("permission not found")
	ErrPermissionAlreadyExists = errors.New("permission already exists")
	ErrInvalidPermissions      = errors.New("invalid permissions")
)

// RoleService interface untuk layanan role management
type RoleService interface {
	// Role management
	GetAllRoles(ctx context.Context, page, limit int, search string) (*model.RolesListResponse, error)
	GetRoleByID(ctx context.Context, roleID uuid.UUID) (*model.RoleResponse, error)
	GetRoleByName(ctx context.Context, name string) (*model.RoleResponse, error)
	CreateRole(ctx context.Context, req *model.CreateRoleRequest) (*model.RoleResponse, error)
	UpdateRole(ctx context.Context, roleID uuid.UUID, req *model.UpdateRoleRequest) (*model.RoleResponse, error)
	DeleteRole(ctx context.Context, roleID uuid.UUID) error
	
	// Permission management
	GetAllPermissions(ctx context.Context, page, limit int, search, resource string) (*model.PermissionsListResponse, error)
	GetPermissionByID(ctx context.Context, permissionID uuid.UUID) (*model.PermissionResponse, error)
	CreatePermission(ctx context.Context, req *model.CreatePermissionRequest) (*model.PermissionResponse, error)
	UpdatePermission(ctx context.Context, permissionID uuid.UUID, req *model.UpdatePermissionRequest) (*model.PermissionResponse, error)
	DeletePermission(ctx context.Context, permissionID uuid.UUID) error
	
	// Role-Permission management
	AssignPermissionsToRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error
	RemovePermissionsFromRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error
	GetRolePermissions(ctx context.Context, roleID uuid.UUID) ([]model.PermissionResponse, error)
	
	// User permission checking
	GetUserPermissions(ctx context.Context, userID uuid.UUID) ([]string, error)
	CheckUserPermission(ctx context.Context, userID uuid.UUID, resource, action string) (bool, error)
	
	// Utility functions
	InitializeDefaultRolesAndPermissions(ctx context.Context) error
}

// roleService implementasi RoleService
type roleService struct {
	roleRepo       repository.RoleRepository
	permissionRepo repository.PermissionRepository
	userRepo       repository.UserRepository
}

// NewRoleService membuat instance baru RoleService
func NewRoleService(roleRepo repository.RoleRepository, permissionRepo repository.PermissionRepository, userRepo repository.UserRepository) RoleService {
	return &roleService{
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
		userRepo:       userRepo,
	}
}

// GetAllRoles mendapatkan semua role dengan pagination
func (s *roleService) GetAllRoles(ctx context.Context, page, limit int, search string) (*model.RolesListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	roles, total, err := s.roleRepo.GetAllRoles(ctx, offset, limit, search)
	if err != nil {
		return nil, fmt.Errorf("failed to get roles: %w", err)
	}

	roleResponses := make([]model.RoleResponse, len(roles))
	for i, role := range roles {
		roleResponses[i] = role.ToRoleResponse()
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &model.RolesListResponse{
		Roles:      roleResponses,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// GetRoleByID mendapatkan role berdasarkan ID
func (s *roleService) GetRoleByID(ctx context.Context, roleID uuid.UUID) (*model.RoleResponse, error) {
	role, err := s.roleRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if err == repository.ErrRoleNotFound {
			return nil, ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	roleResponse := role.ToRoleResponse()
	return &roleResponse, nil
}

// GetRoleByName mendapatkan role berdasarkan nama
func (s *roleService) GetRoleByName(ctx context.Context, name string) (*model.RoleResponse, error) {
	role, err := s.roleRepo.GetRoleByName(ctx, name)
	if err != nil {
		if err == repository.ErrRoleNotFound {
			return nil, ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	roleResponse := role.ToRoleResponse()
	return &roleResponse, nil
}

// CreateRole membuat role baru
func (s *roleService) CreateRole(ctx context.Context, req *model.CreateRoleRequest) (*model.RoleResponse, error) {
	// Cek apakah role sudah ada
	existingRole, err := s.roleRepo.GetRoleByName(ctx, req.Name)
	if err == nil && existingRole != nil {
		return nil, ErrRoleAlreadyExists
	}

	// Validasi permissions
	if len(req.Permissions) > 0 {
		for _, permissionID := range req.Permissions {
			_, err := s.permissionRepo.GetPermissionByID(ctx, permissionID)
			if err != nil {
				return nil, ErrInvalidPermissions
			}
		}
	}

	// Buat role baru
	role := &model.Role{
		Name:        req.Name,
		DisplayName: req.DisplayName,
		Description: req.Description,
		Active:      true,
	}

	// Simpan role
	createdRole, err := s.roleRepo.CreateRole(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	// Assign permissions jika ada
	if len(req.Permissions) > 0 {
		err = s.roleRepo.AssignPermissionsToRole(ctx, createdRole.ID, req.Permissions)
		if err != nil {
			return nil, fmt.Errorf("failed to assign permissions: %w", err)
		}
		
		// Reload role dengan permissions
		createdRole, err = s.roleRepo.GetRoleByID(ctx, createdRole.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to reload role: %w", err)
		}
	}

	roleResponse := createdRole.ToRoleResponse()
	return &roleResponse, nil
}

// UpdateRole mengupdate role
func (s *roleService) UpdateRole(ctx context.Context, roleID uuid.UUID, req *model.UpdateRoleRequest) (*model.RoleResponse, error) {
	// Cek apakah role ada
	role, err := s.roleRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if err == repository.ErrRoleNotFound {
			return nil, ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	// Update fields yang diberikan
	if req.DisplayName != nil {
		role.DisplayName = *req.DisplayName
	}
	if req.Description != nil {
		role.Description = *req.Description
	}
	if req.Active != nil {
		role.Active = *req.Active
	}

	// Update role
	updatedRole, err := s.roleRepo.UpdateRole(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("failed to update role: %w", err)
	}

	// Update permissions jika diberikan
	if len(req.Permissions) > 0 {
		// Validasi permissions
		for _, permissionID := range req.Permissions {
			_, err := s.permissionRepo.GetPermissionByID(ctx, permissionID)
			if err != nil {
				return nil, ErrInvalidPermissions
			}
		}

		// Replace permissions
		err = s.roleRepo.ReplaceRolePermissions(ctx, roleID, req.Permissions)
		if err != nil {
			return nil, fmt.Errorf("failed to update permissions: %w", err)
		}
		
		// Reload role dengan permissions
		updatedRole, err = s.roleRepo.GetRoleByID(ctx, roleID)
		if err != nil {
			return nil, fmt.Errorf("failed to reload role: %w", err)
		}
	}

	roleResponse := updatedRole.ToRoleResponse()
	return &roleResponse, nil
}

// DeleteRole menghapus role
func (s *roleService) DeleteRole(ctx context.Context, roleID uuid.UUID) error {
	// Cek apakah role ada
	_, err := s.roleRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if err == repository.ErrRoleNotFound {
			return ErrRoleNotFound
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Cek apakah role sedang digunakan
	userCount, err := s.userRepo.CountUsersByRoleID(ctx, roleID)
	if err != nil {
		return fmt.Errorf("failed to check role usage: %w", err)
	}

	if userCount > 0 {
		return ErrRoleInUse
	}

	// Hapus role
	err = s.roleRepo.DeleteRole(ctx, roleID)
	if err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}

	return nil
}

// GetAllPermissions mendapatkan semua permission dengan pagination
func (s *roleService) GetAllPermissions(ctx context.Context, page, limit int, search, resource string) (*model.PermissionsListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	permissions, total, err := s.permissionRepo.GetAllPermissions(ctx, offset, limit, search, resource)
	if err != nil {
		return nil, fmt.Errorf("failed to get permissions: %w", err)
	}

	permissionResponses := make([]model.PermissionResponse, len(permissions))
	for i, permission := range permissions {
		permissionResponses[i] = permission.ToPermissionResponse()
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return &model.PermissionsListResponse{
		Permissions: permissionResponses,
		Total:       total,
		Page:        page,
		Limit:       limit,
		TotalPages:  totalPages,
	}, nil
}

// GetPermissionByID mendapatkan permission berdasarkan ID
func (s *roleService) GetPermissionByID(ctx context.Context, permissionID uuid.UUID) (*model.PermissionResponse, error) {
	permission, err := s.permissionRepo.GetPermissionByID(ctx, permissionID)
	if err != nil {
		if err == repository.ErrPermissionNotFound {
			return nil, ErrPermissionNotFound
		}
		return nil, fmt.Errorf("failed to get permission: %w", err)
	}

	permissionResponse := permission.ToPermissionResponse()
	return &permissionResponse, nil
}

// CreatePermission membuat permission baru
func (s *roleService) CreatePermission(ctx context.Context, req *model.CreatePermissionRequest) (*model.PermissionResponse, error) {
	// Cek apakah permission sudah ada
	existingPermission, err := s.permissionRepo.GetPermissionByName(ctx, req.Name)
	if err == nil && existingPermission != nil {
		return nil, ErrPermissionAlreadyExists
	}

	// Buat permission baru
	permission := &model.Permission{
		Name:        req.Name,
		DisplayName: req.DisplayName,
		Description: req.Description,
		Resource:    req.Resource,
		Action:      req.Action,
		Active:      true,
	}

	// Simpan permission
	createdPermission, err := s.permissionRepo.CreatePermission(ctx, permission)
	if err != nil {
		return nil, fmt.Errorf("failed to create permission: %w", err)
	}

	permissionResponse := createdPermission.ToPermissionResponse()
	return &permissionResponse, nil
}

// UpdatePermission mengupdate permission
func (s *roleService) UpdatePermission(ctx context.Context, permissionID uuid.UUID, req *model.UpdatePermissionRequest) (*model.PermissionResponse, error) {
	// Cek apakah permission ada
	permission, err := s.permissionRepo.GetPermissionByID(ctx, permissionID)
	if err != nil {
		if err == repository.ErrPermissionNotFound {
			return nil, ErrPermissionNotFound
		}
		return nil, fmt.Errorf("failed to get permission: %w", err)
	}

	// Update fields yang diberikan
	if req.DisplayName != nil {
		permission.DisplayName = *req.DisplayName
	}
	if req.Description != nil {
		permission.Description = *req.Description
	}
	if req.Resource != nil {
		permission.Resource = *req.Resource
	}
	if req.Action != nil {
		permission.Action = *req.Action
	}
	if req.Active != nil {
		permission.Active = *req.Active
	}

	// Update permission
	updatedPermission, err := s.permissionRepo.UpdatePermission(ctx, permission)
	if err != nil {
		return nil, fmt.Errorf("failed to update permission: %w", err)
	}

	permissionResponse := updatedPermission.ToPermissionResponse()
	return &permissionResponse, nil
}

// DeletePermission menghapus permission
func (s *roleService) DeletePermission(ctx context.Context, permissionID uuid.UUID) error {
	// Cek apakah permission ada
	_, err := s.permissionRepo.GetPermissionByID(ctx, permissionID)
	if err != nil {
		if err == repository.ErrPermissionNotFound {
			return ErrPermissionNotFound
		}
		return fmt.Errorf("failed to get permission: %w", err)
	}

	// Hapus permission
	err = s.permissionRepo.DeletePermission(ctx, permissionID)
	if err != nil {
		return fmt.Errorf("failed to delete permission: %w", err)
	}

	return nil
}

// AssignPermissionsToRole menambahkan permissions ke role
func (s *roleService) AssignPermissionsToRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error {
	// Validasi role
	_, err := s.roleRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if err == repository.ErrRoleNotFound {
			return ErrRoleNotFound
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Validasi permissions
	for _, permissionID := range permissionIDs {
		_, err := s.permissionRepo.GetPermissionByID(ctx, permissionID)
		if err != nil {
			return ErrInvalidPermissions
		}
	}

	// Assign permissions
	err = s.roleRepo.AssignPermissionsToRole(ctx, roleID, permissionIDs)
	if err != nil {
		return fmt.Errorf("failed to assign permissions: %w", err)
	}

	return nil
}

// RemovePermissionsFromRole menghapus permissions dari role
func (s *roleService) RemovePermissionsFromRole(ctx context.Context, roleID uuid.UUID, permissionIDs []uuid.UUID) error {
	// Validasi role
	_, err := s.roleRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if err == repository.ErrRoleNotFound {
			return ErrRoleNotFound
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Remove permissions
	err = s.roleRepo.RemovePermissionsFromRole(ctx, roleID, permissionIDs)
	if err != nil {
		return fmt.Errorf("failed to remove permissions: %w", err)
	}

	return nil
}

// GetRolePermissions mendapatkan permissions dari role
func (s *roleService) GetRolePermissions(ctx context.Context, roleID uuid.UUID) ([]model.PermissionResponse, error) {
	// Validasi role
	role, err := s.roleRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if err == repository.ErrRoleNotFound {
			return nil, ErrRoleNotFound
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	permissionResponses := make([]model.PermissionResponse, len(role.Permissions))
	for i, permission := range role.Permissions {
		permissionResponses[i] = permission.ToPermissionResponse()
	}

	return permissionResponses, nil
}

// GetUserPermissions mendapatkan semua permissions user
func (s *roleService) GetUserPermissions(ctx context.Context, userID uuid.UUID) ([]string, error) {
	user, err := s.userRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Jika user tidak memiliki role baru, return empty
	if user.RoleID == nil {
		return []string{}, nil
	}

	role, err := s.roleRepo.GetRoleByID(ctx, *user.RoleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user role: %w", err)
	}

	permissions := make([]string, len(role.Permissions))
	for i, permission := range role.Permissions {
		permissions[i] = permission.Resource + ":" + permission.Action
	}

	return permissions, nil
}

// CheckUserPermission mengecek apakah user memiliki permission tertentu
func (s *roleService) CheckUserPermission(ctx context.Context, userID uuid.UUID, resource, action string) (bool, error) {
	permissions, err := s.GetUserPermissions(ctx, userID)
	if err != nil {
		return false, err
	}

	requiredPermission := resource + ":" + action
	managePermission := resource + ":manage"

	for _, permission := range permissions {
		if permission == requiredPermission || permission == managePermission {
			return true, nil
		}
	}

	return false, nil
}

// InitializeDefaultRolesAndPermissions membuat role dan permission default
func (s *roleService) InitializeDefaultRolesAndPermissions(ctx context.Context) error {
	// Default permissions
	defaultPermissions := []model.CreatePermissionRequest{
		// User management permissions
		{Name: "users:list", DisplayName: "List Users", Description: "View list of users", Resource: "users", Action: "list"},
		{Name: "users:read", DisplayName: "Read User", Description: "View user details", Resource: "users", Action: "read"},
		{Name: "users:create", DisplayName: "Create User", Description: "Create new users", Resource: "users", Action: "create"},
		{Name: "users:update", DisplayName: "Update User", Description: "Update user information", Resource: "users", Action: "update"},
		{Name: "users:delete", DisplayName: "Delete User", Description: "Delete users", Resource: "users", Action: "delete"},
		{Name: "users:manage", DisplayName: "Manage Users", Description: "Full user management access", Resource: "users", Action: "manage"},
		
		// Role management permissions
		{Name: "roles:list", DisplayName: "List Roles", Description: "View list of roles", Resource: "roles", Action: "list"},
		{Name: "roles:read", DisplayName: "Read Role", Description: "View role details", Resource: "roles", Action: "read"},
		{Name: "roles:create", DisplayName: "Create Role", Description: "Create new roles", Resource: "roles", Action: "create"},
		{Name: "roles:update", DisplayName: "Update Role", Description: "Update role information", Resource: "roles", Action: "update"},
		{Name: "roles:delete", DisplayName: "Delete Role", Description: "Delete roles", Resource: "roles", Action: "delete"},
		{Name: "roles:manage", DisplayName: "Manage Roles", Description: "Full role management access", Resource: "roles", Action: "manage"},
		
		// Permission management permissions
		{Name: "permissions:list", DisplayName: "List Permissions", Description: "View list of permissions", Resource: "permissions", Action: "list"},
		{Name: "permissions:read", DisplayName: "Read Permission", Description: "View permission details", Resource: "permissions", Action: "read"},
		{Name: "permissions:create", DisplayName: "Create Permission", Description: "Create new permissions", Resource: "permissions", Action: "create"},
		{Name: "permissions:update", DisplayName: "Update Permission", Description: "Update permission information", Resource: "permissions", Action: "update"},
		{Name: "permissions:delete", DisplayName: "Delete Permission", Description: "Delete permissions", Resource: "permissions", Action: "delete"},
		{Name: "permissions:manage", DisplayName: "Manage Permissions", Description: "Full permission management access", Resource: "permissions", Action: "manage"},
		
		// Dashboard permissions
		{Name: "dashboard:read", DisplayName: "View Dashboard", Description: "Access dashboard", Resource: "dashboard", Action: "read"},
		{Name: "dashboard:stats", DisplayName: "View Statistics", Description: "View dashboard statistics", Resource: "dashboard", Action: "stats"},
	}

	// Create permissions
	permissionIDs := make(map[string]uuid.UUID)
	for _, permReq := range defaultPermissions {
		// Check if permission already exists
		existing, err := s.permissionRepo.GetPermissionByName(ctx, permReq.Name)
		if err == nil && existing != nil {
			permissionIDs[permReq.Name] = existing.ID
			continue
		}

		// Create new permission
		permission := &model.Permission{
			Name:        permReq.Name,
			DisplayName: permReq.DisplayName,
			Description: permReq.Description,
			Resource:    permReq.Resource,
			Action:      permReq.Action,
			Active:      true,
		}

		createdPermission, err := s.permissionRepo.CreatePermission(ctx, permission)
		if err != nil {
			return fmt.Errorf("failed to create permission %s: %w", permReq.Name, err)
		}

		permissionIDs[permReq.Name] = createdPermission.ID
	}

	// Default roles
	defaultRoles := []struct {
		name        string
		displayName string
		description string
		permissions []string
	}{
		{
			name:        "admin",
			displayName: "Administrator",
			description: "Full system access",
			permissions: []string{
				"users:manage", "roles:manage", "permissions:manage", "dashboard:read", "dashboard:stats",
			},
		},
		{
			name:        "user",
			displayName: "Regular User",
			description: "Basic user access",
			permissions: []string{
				"dashboard:read",
			},
		},
		{
			name:        "moderator",
			displayName: "Moderator",
			description: "User management access",
			permissions: []string{
				"users:list", "users:read", "users:update", "dashboard:read", "dashboard:stats",
			},
		},
	}

	// Create roles
	for _, roleData := range defaultRoles {
		// Check if role already exists
		existing, err := s.roleRepo.GetRoleByName(ctx, roleData.name)
		if err == nil && existing != nil {
			continue
		}

		// Create new role
		role := &model.Role{
			Name:        roleData.name,
			DisplayName: roleData.displayName,
			Description: roleData.description,
			Active:      true,
		}

		createdRole, err := s.roleRepo.CreateRole(ctx, role)
		if err != nil {
			return fmt.Errorf("failed to create role %s: %w", roleData.name, err)
		}

		// Assign permissions to role
		var rolePermissionIDs []uuid.UUID
		for _, permName := range roleData.permissions {
			if permID, exists := permissionIDs[permName]; exists {
				rolePermissionIDs = append(rolePermissionIDs, permID)
			}
		}

		if len(rolePermissionIDs) > 0 {
			err = s.roleRepo.AssignPermissionsToRole(ctx, createdRole.ID, rolePermissionIDs)
			if err != nil {
				return fmt.Errorf("failed to assign permissions to role %s: %w", roleData.name, err)
			}
		}
	}

	return nil
}