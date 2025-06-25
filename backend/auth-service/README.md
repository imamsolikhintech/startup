# Auth Service Microservice

Microservice untuk autentikasi dengan fitur registrasi, login, JWT, dan login Google. Menggunakan Redis untuk caching dan MySQL 8 untuk penyimpanan data.

## Fitur

- Registrasi pengguna
- Login dengan email dan password
- Login dengan Google OAuth
- Autentikasi JWT dengan refresh token
- Role-based access control (RBAC)
- User management (CRUD operations)
- Role management (CRUD operations)
- Informasi login lengkap (IP, user agent, lokasi, dll)
- Proteksi keamanan terhadap serangan umum
- Database migrations
- Dokumentasi API dengan Swagger (dapat diaktifkan/dinonaktifkan melalui konfigurasi)

## Struktur Proyek

```
auth-service/
├── cmd/
│   └── api/
│       └── main.go              # Entry point aplikasi
├── config/
│   └── config.go               # Konfigurasi aplikasi
├── internal/
│   ├── handler/                # HTTP handlers
│   │   ├── auth_handler.go     # Handler autentikasi
│   │   ├── role_handler.go     # Handler role management
│   │   └── user_handler.go     # Handler user management
│   ├── middleware/             # HTTP middleware
│   │   └── auth_middleware.go  # Middleware autentikasi
│   ├── model/                  # Data models
│   │   ├── response.go         # Response models
│   │   ├── role.go             # Role model
│   │   └── user.go             # User model
│   ├── repository/             # Data access layer
│   │   ├── mysql_repository.go # MySQL repository
│   │   ├── redis_repository.go # Redis repository
│   │   └── role_repository.go  # Role repository
│   ├── service/                # Business logic
│   │   ├── auth_service.go     # Service autentikasi
│   │   └── role_service.go     # Service role management
│   └── utils/                  # Utility functions
│       ├── jwt_util.go         # JWT utilities
│       ├── password_util.go    # Password utilities
│       └── security_util.go    # Security utilities
├── docs/                       # API documentation
│   ├── docs.go                 # Swagger docs generator
│   ├── swagger.json            # Swagger JSON spec
│   └── swagger.yaml            # Swagger YAML spec
├── migrations/                 # Database migrations
│   └── init.sql                # Initial database schema
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── Dockerfile                 # Docker configuration
├── Makefile                   # Build automation
├── docker-compose.yml         # Docker Compose configuration
├── go.mod                     # Go module definition
├── go.sum                     # Go module checksums
└── README.md                  # Project documentation
```

## Teknologi yang Digunakan

- Go (Golang)
- MySQL 8
- Redis
- JWT
- Google OAuth2
- Docker

## Cara Menjalankan

1. Clone repository
2. Salin `.env.example` menjadi `.env` dan sesuaikan konfigurasi
3. Jalankan database migrations:
   ```
   make migrate
   ```
4. Jalankan dengan Docker:
   ```
   docker-compose up -d
   ```
5. Atau jalankan secara lokal:
   ```
   go run cmd/api/main.go
   ```
6. Generate dokumentasi Swagger:
   ```
   make swagger
   ```
7. Akses dokumentasi Swagger di `http://localhost:8080/swagger/index.html`

## Endpoint API

### Authentication Endpoints
- `POST /api/v1/auth/register` - Registrasi pengguna baru
- `POST /api/v1/auth/login` - Login dengan email dan password
- `GET /api/v1/auth/google/login` - Inisiasi login dengan Google
- `GET /api/v1/auth/google/callback` - Callback URL untuk Google OAuth
- `POST /api/v1/auth/refresh` - Refresh token JWT
- `GET /api/v1/auth/me` - Mendapatkan informasi pengguna yang sedang login
- `POST /api/v1/auth/logout` - Logout pengguna

### User Management Endpoints
- `GET /api/v1/users` - Mendapatkan daftar pengguna
- `GET /api/v1/users/{id}` - Mendapatkan detail pengguna
- `PUT /api/v1/users/{id}` - Update informasi pengguna
- `DELETE /api/v1/users/{id}` - Hapus pengguna
- `PUT /api/v1/users/{id}/roles` - Update role pengguna

### Role Management Endpoints
- `GET /api/v1/roles` - Mendapatkan daftar role
- `POST /api/v1/roles` - Membuat role baru
- `GET /api/v1/roles/{id}` - Mendapatkan detail role
- `PUT /api/v1/roles/{id}` - Update role
- `DELETE /api/v1/roles/{id}` - Hapus role

## Role-Based Access Control (RBAC)

Sistem ini mengimplementasikan RBAC untuk mengatur akses pengguna:

### Default Roles
- **Admin**: Akses penuh ke semua fitur sistem
- **User**: Akses terbatas untuk pengguna biasa
- **Moderator**: Akses menengah untuk moderasi konten

### Permission System
- Setiap role memiliki set permission yang berbeda
- Permission dapat di-assign ke role secara dinamis
- User dapat memiliki multiple roles
- Middleware otomatis memvalidasi permission untuk setiap endpoint

### Role Management
- Admin dapat membuat, mengubah, dan menghapus role
- Admin dapat mengassign/unassign role ke user
- Role hierarchy untuk inheritance permission

## Keamanan

Layanan ini menerapkan beberapa fitur keamanan:

- Password hashing dengan bcrypt
- JWT dengan refresh token mechanism
- Role-based access control (RBAC)
- Rate limiting untuk mencegah brute force
- Penyimpanan informasi login (IP, user agent, lokasi, waktu)
- Deteksi login mencurigakan
- Proteksi terhadap CSRF, XSS, dan SQL Injection
- Validasi input yang ketat
- Secure headers dan CORS configuration