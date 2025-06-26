# Project Development Rules - AI Standard

Aturan dan panduan pengembangan untuk proyek RND dengan standar AI development yang mengikuti struktur arsitektur microservices.

## 📋 Aturan Umum

### Struktur Direktori Utama
```
startup/
├── .trae/                  # AI development rules dan konfigurasi
│   └── rules/
│       └── project_rules.md
├── backend/                # Microservices backend
│   └── auth-service/      # Service autentikasi
├── frontend/              # Vue.js application
├── docs/                  # Dokumentasi proyek
└── README.md              # Dokumentasi utama
```

### Environment Management
- **WAJIB**: Gunakan `.env.example` sebagai template untuk setiap service
- **DILARANG**: Commit file `.env` ke repository
- **STANDAR**: Setiap service harus memiliki environment variables yang terdokumentasi
- **KEAMANAN**: Sensitive data harus menggunakan environment variables

### Git Workflow Standards
- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **Branch Naming**: 
  - `feature/auth-integration`
  - `bugfix/login-validation`
  - `hotfix/security-patch`
  - `release/v1.0.0`
- **Pull Request**: Wajib review sebelum merge ke main branch
- **Commit Message**: Bahasa Inggris, deskriptif, maksimal 50 karakter untuk subject

## 🔧 Backend Rules (Go Microservices)

### Arsitektur Microservices
```
backend/
├── auth-service/          # Authentication & Authorization
├── user-service/          # User management (future)
├── notification-service/  # Notification system (future)
└── api-gateway/          # API Gateway (future)
```

### Struktur Service Standard
```
service-name/
├── cmd/
│   └── api/
│       └── main.go        # Entry point
├── internal/              # Private application code
│   ├── handler/          # HTTP handlers (controller layer)
│   ├── service/          # Business logic layer
│   ├── repository/       # Data access layer
│   ├── model/           # Data models dan structs
│   ├── middleware/      # HTTP middleware
│   └── utils/           # Utility functions
├── config/               # Configuration management
├── migrations/           # Database migrations
├── docs/                # Swagger documentation
├── .env.example         # Environment template
├── Dockerfile           # Container configuration
├── Makefile            # Build automation
├── docker-compose.yml  # Local development
├── go.mod              # Go module
└── README.md           # Service documentation
```

### Coding Standards Go
- **Formatting**: Gunakan `gofmt` dan `goimports`
- **Linting**: Gunakan `golangci-lint`
- **Naming**: Follow Go naming conventions (camelCase, PascalCase)
- **Documentation**: Semua exported functions harus memiliki godoc
- **Error Handling**: 
  - Gunakan custom error types
  - Wrap errors dengan context: `fmt.Errorf("operation failed: %w", err)`
  - Log errors dengan level yang sesuai
- **Context**: Gunakan context.Context untuk timeout dan cancellation
- **Testing**: Minimum 80% code coverage untuk business logic

### Database Standards
- **ORM**: Gunakan GORM untuk database operations
- **Migrations**: Semua perubahan schema melalui migration files
- **Naming Convention**: 
  - Tables: `snake_case` (users, user_roles)
  - Columns: `snake_case` (created_at, user_id)
  - Indexes: `idx_table_column`
- **Relationships**: Definisikan foreign keys dan constraints
- **Soft Delete**: Gunakan soft delete untuk data penting

### API Design Standards
- **RESTful**: Follow REST principles
- **Versioning**: `/api/v1/` prefix untuk semua endpoints
- **HTTP Methods**: 
  - GET: Retrieve data
  - POST: Create new resource
  - PUT: Update entire resource
  - PATCH: Partial update
  - DELETE: Remove resource
- **Status Codes**:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error
- **Response Format**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid"
  }
}
```

### Security Standards
- **Authentication**: JWT dengan refresh token mechanism
- **Authorization**: Role-based access control (RBAC)
- **Password**: Bcrypt hashing dengan minimum cost 12
- **Rate Limiting**: Implement rate limiting untuk API endpoints
- **CORS**: Configure CORS dengan whitelist domains
- **Input Validation**: Validate semua input dengan struct tags
- **SQL Injection**: Gunakan parameterized queries
- **Logging**: Log security events (login attempts, permission changes)

## 🎨 Frontend Rules (Vue.js + TypeScript)

### Struktur Aplikasi
```
src/
├── api/                  # API layer
│   ├── endpoint/        # API endpoints configuration
│   ├── service/         # Service layer untuk business logic
│   ├── types/           # TypeScript type definitions
│   └── request/         # Request helpers dan interceptors
├── components/          # Reusable components
│   ├── common/         # Common UI components
│   ├── forms/          # Form components
│   └── [feature]/      # Feature-specific components
├── layouts/            # Layout components
├── views/              # Page components (routes)
├── stores/             # Pinia stores
├── router/             # Vue Router configuration
├── assets/             # Static assets
│   ├── styles/         # Global styles
│   └── images/         # Images dan icons
├── utils/              # Utility functions
└── types/              # Global TypeScript types
```

### Coding Standards Vue.js
- **TypeScript**: Wajib menggunakan TypeScript untuk type safety
- **Composition API**: Gunakan Composition API untuk semua components
- **Component Naming**: 
  - Files: PascalCase (`UserProfile.vue`)
  - Components: PascalCase dalam template
  - Props: camelCase
- **Props Definition**: 
```typescript
interface Props {
  userId: string
  isActive?: boolean
}

const props = defineProps<Props>()
```
- **Emits Definition**:
```typescript
interface Emits {
  update: [value: string]
  delete: [id: string]
}

const emit = defineEmits<Emits>()
```

### State Management (Pinia)
- **Store Structure**: Satu store per domain/feature
- **Naming**: `useAuthStore`, `useUserStore`
- **Actions**: Untuk async operations dan mutations
- **Getters**: Untuk computed state
- **State**: Reactive data yang minimal

### Styling Standards
- **Framework**: Vuetify untuk UI components
- **Scoped Styles**: Gunakan `<style scoped>` atau CSS modules
- **Responsive**: Mobile-first approach
- **Theme**: Support dark/light mode
- **Spacing**: Gunakan Vuetify spacing system
- **Colors**: Gunakan Vuetify color palette

### API Integration
- **Centralized**: Semua API calls melalui service layer
- **Error Handling**: Global error handling dengan interceptors
- **Loading States**: Implement loading indicators
- **Type Safety**: Type-safe API calls dengan TypeScript
- **Caching**: Implement caching untuk data yang jarang berubah

## 🔒 Security & Authentication

### JWT Implementation
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Storage**: localStorage untuk development, httpOnly cookies untuk production
- **Auto Refresh**: Automatic token refresh sebelum expiry
- **Logout**: Clear semua tokens dan redirect ke login

### Role-Based Access Control (RBAC)
- **Roles**: Admin, User, Guest
- **Permissions**: Granular permissions per feature
- **Route Guards**: Protect routes berdasarkan role
- **Component Guards**: Hide/show components berdasarkan permission

## 📊 Monitoring & Logging

### Backend Logging
- **Library**: Logrus untuk structured logging
- **Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Format**: JSON format untuk production
- **Fields**: Include request_id, user_id, timestamp
- **Rotation**: Log rotation dengan size dan time-based

### Frontend Monitoring
- **Error Tracking**: Global error handler
- **Performance**: Monitor route loading times
- **User Actions**: Track important user interactions
- **Console**: Remove console.log di production build

## 🧪 Testing Standards

### Backend Testing
- **Unit Tests**: Minimum 80% coverage untuk business logic
- **Integration Tests**: Test API endpoints
- **Test Files**: `*_test.go` naming convention
- **Mocking**: Mock external dependencies
- **Test Data**: Use test fixtures dan factories

### Frontend Testing
- **Unit Tests**: Test components dan utilities
- **E2E Tests**: Test critical user flows
- **Test Files**: `*.test.ts` atau `*.spec.ts`
- **Mocking**: Mock API calls dan external dependencies

## 🚀 Deployment & DevOps

### Docker Standards
- **Multi-stage**: Gunakan multi-stage builds
- **Base Images**: Gunakan official images (golang:alpine, node:alpine)
- **Security**: Non-root user dalam container
- **Size**: Optimize image size
- **Health Checks**: Implement health check endpoints

### Environment Configuration
- **Development**: Local development dengan hot reload
- **Staging**: Mirror production environment
- **Production**: Optimized builds dengan monitoring

## 📚 Documentation Standards

### API Documentation
- **Swagger**: Generate OpenAPI documentation
- **Examples**: Include request/response examples
- **Authentication**: Document auth requirements
- **Error Codes**: Document all possible error responses

### Code Documentation
- **README**: Setiap service harus memiliki README lengkap
- **Comments**: Explain complex business logic
- **Changelog**: Maintain CHANGELOG.md untuk releases
- **Architecture**: Document system architecture dan decisions

## 🔄 Integration Standards

### Frontend-Backend Integration
- **API Versioning**: Maintain backward compatibility
- **Error Handling**: Consistent error format
- **Data Validation**: Validate di frontend dan backend
- **CORS**: Configure CORS untuk cross-origin requests

### Service Communication
- **HTTP**: RESTful APIs untuk synchronous communication
- **Message Queue**: Untuk asynchronous communication (future)
- **Service Discovery**: Untuk microservices communication (future)

## 📋 Development Workflow

### Daily Development
1. Pull latest changes dari main branch
2. Create feature branch dari main
3. Implement feature dengan tests
4. Run linting dan formatting
5. Commit dengan conventional commit format
6. Push dan create pull request
7. Code review dan merge

### Release Process
1. Create release branch
2. Update version numbers
3. Run full test suite
4. Build dan test deployment
5. Create release tag
6. Deploy ke staging
7. Deploy ke production
8. Monitor dan rollback jika diperlukan

---

**Note**: Aturan ini harus diikuti oleh semua developer dan akan di-review secara berkala untuk improvement dan update sesuai dengan perkembangan teknologi dan kebutuhan proyek.