# Project Rules

Aturan dan panduan untuk pengembangan proyek RND.

## 📋 Aturan Umum

### Struktur Direktori
- **Backend**: Semua layanan backend berada di folder `backend/`
- **Frontend**: Aplikasi frontend berada di folder `frontend/`
- **Dokumentasi**: File dokumentasi menggunakan format Markdown
- **Environment**: File `.env` tidak boleh di-commit, gunakan `.env.example` sebagai template

### Git Workflow
- Gunakan conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, dll.
- Branch naming: `feature/nama-fitur`, `bugfix/nama-bug`, `hotfix/nama-hotfix`
- Pull request wajib di-review sebelum merge

## 🔧 Backend Rules (Go)

### Struktur Proyek
```
backend/service-name/
├── cmd/                 # Entry points
├── internal/           # Private application code
│   ├── handlers/      # HTTP handlers
│   ├── services/      # Business logic
│   ├── models/        # Data models
│   └── repository/    # Data access layer
├── config/            # Configuration
├── migrations/        # Database migrations
├── docs/             # API documentation
├── Dockerfile        # Container configuration
├── Makefile          # Build automation
└── docker-compose.yml # Local development
```

### Coding Standards
- Gunakan `gofmt` untuk formatting
- Ikuti Go naming conventions
- Semua public functions harus memiliki dokumentasi
- Error handling yang proper dengan custom error types
- Gunakan context untuk timeout dan cancellation

### Database
- Gunakan migrations untuk perubahan schema
- Naming convention: `snake_case` untuk tabel dan kolom
- Index yang diperlukan harus didefinisikan dalam migrations

### API Design
- RESTful API design
- Gunakan HTTP status codes yang sesuai
- Response format konsisten (JSON)
- API versioning dengan prefix `/api/v1/`
- Dokumentasi API dengan OpenAPI/Swagger

## 🎨 Frontend Rules (Vue.js)

### Struktur Proyek
```
src/
├── api/               # API layer
├── components/        # Reusable components
├── layouts/          # Layout components
├── views/            # Page components
├── stores/           # Pinia stores
├── router/           # Vue Router
└── assets/           # Static assets
```

### Coding Standards
- Gunakan TypeScript untuk type safety
- Component naming: PascalCase
- File naming: kebab-case
- Gunakan Composition API
- Props dan emits harus memiliki type definitions

### State Management
- Gunakan Pinia untuk state management
- Satu store per domain/feature
- Actions untuk async operations
- Getters untuk computed state

### Styling
- Gunakan Vuetify untuk UI components
- CSS modules atau scoped styles
- Responsive design (mobile-first)
- Consistent spacing dan typography

### API Integration
- Centralized API services di folder `api/`
- Error handling dengan interceptors
- Loading states untuk UX yang baik
- Type-safe API calls

## 🔒 Security Rules

### Authentication & Authorization
- JWT tokens untuk authentication
- Refresh token mechanism
- Role-based access control (RBAC)
- Secure password hashing (bcrypt)

### Data Protection
- Input validation dan sanitization
- SQL injection prevention
- XSS protection
- CORS configuration yang proper

### Environment Variables
- Sensitive data harus di environment variables
- Tidak ada hardcoded secrets
- Different configs untuk different environments

## 🧪 Testing Rules

### Backend Testing
- Unit tests untuk business logic
- Integration tests untuk API endpoints
- Test coverage minimal 80%
- Mock external dependencies

### Frontend Testing
- Component testing dengan Vue Test Utils
- E2E testing untuk critical user flows
- Accessibility testing

## 📦 Deployment Rules

### Docker
- Multi-stage builds untuk optimasi size
- Non-root user dalam container
- Health checks untuk services
- Resource limits yang sesuai

### CI/CD
- Automated testing pada setiap PR
- Automated deployment untuk staging
- Manual approval untuk production
- Rollback strategy yang jelas

## 📚 Documentation Rules

### Code Documentation
- README.md untuk setiap service/module
- API documentation yang up-to-date
- Architecture decision records (ADRs)
- Setup dan deployment instructions

### Comments
- Explain "why" bukan "what"
- Update comments saat code berubah
- Avoid obvious comments

## 🔍 Code Review Guidelines

### What to Review
- Code quality dan readability
- Security vulnerabilities
- Performance implications
- Test coverage
- Documentation updates

### Review Process
- Minimal 1 reviewer untuk feature
- 2 reviewers untuk critical changes
- Address semua comments sebelum merge
- Use constructive feedback

## 📈 Performance Guidelines

### Backend Performance
- Database query optimization
- Proper indexing
- Caching strategy
- Connection pooling

### Frontend Performance
- Code splitting dan lazy loading
- Image optimization
- Bundle size monitoring
- Core Web Vitals optimization

---

**Note**: Aturan ini adalah living document yang akan diupdate seiring perkembangan proyek.