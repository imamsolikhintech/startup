# Vue Admin Dashboard

Sebuah dashboard admin modern yang dibangun dengan Vue 3, TypeScript, dan Vuetify.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [Komponen](#komponen)
- [Store Management](#store-management)
- [Routing](#routing)
- [Kontribusi](#kontribusi)

## ✨ Fitur

- 🎨 **UI Modern**: Menggunakan Vuetify dengan desain Material Design
- 🔐 **Autentikasi**: Sistem login dan registrasi yang aman
- 📊 **Dashboard Analytics**: Grafik dan chart interaktif
- 💬 **Chat Widget**: Sistem chat real-time
- 🔔 **Notifikasi**: Sistem notifikasi dengan auto-close
- 📱 **Responsive**: Desain yang responsif untuk semua perangkat
- 🌙 **Dark Mode**: Support tema gelap dan terang
- ⚡ **Loading States**: Loading indicator saat perpindahan halaman
- 🎯 **TypeScript**: Type safety untuk development yang lebih baik
- 📦 **PWA Ready**: Progressive Web App dengan service worker

## 🛠 Teknologi

- **Vue 3** - Framework JavaScript progresif
- **TypeScript** - JavaScript dengan type safety
- **Vuetify** - Material Design component framework
- **Pinia** - State management untuk Vue
- **Vue Router** - Official router untuk Vue.js
- **Chart.js** - Library untuk membuat chart
- **Vite** - Build tool yang cepat
- **PWA** - Progressive Web App capabilities

## 📁 Struktur Proyek

```
src/
├── App.vue                 # Root component
├── main.ts                 # Entry point aplikasi
├── style.css              # Global styles
├── vite-env.d.ts          # Vite type definitions
│
├── api/                   # API layer
│   ├── README.md         # API documentation
│   ├── endpoint/         # API endpoints configuration
│   │   ├── axios.ts      # Axios instance dan interceptors
│   │   └── base.ts       # Base URL configurations
│   ├── examples/         # Usage examples
│   │   └── usage.ts      # API usage examples
│   ├── index.ts          # API exports
│   ├── request/          # Request helpers
│   │   └── helpers.ts    # Request utility functions
│   ├── service/          # Service layer
│   │   ├── authService.ts    # Authentication service
│   │   ├── fileService.ts    # File management service
│   │   └── index.ts          # Service exports
│   └── types/            # TypeScript types
│       └── index.ts      # API type definitions
│
├── assets/               # Static assets
│   ├── styles/          # Global stylesheets
│   │   └── main.css     # Main stylesheet
│   └── vue.svg          # Vue logo
│
├── components/          # Reusable components
│   ├── HelloWorld.vue   # Demo component
│   ├── charts/         # Chart components
│   │   ├── DoughnutChart.vue
│   │   └── LineChart.vue
│   ├── chat/           # Chat system
│   │   └── ChatWidget.vue
│   ├── common/         # Common components
│   │   └── PageLoader.vue
│   ├── dashboard/      # Dashboard components
│   │   └── StatsCard.vue
│   └── notifications/  # Notification system
│       ├── NotificationDropdown.vue
│       └── NotificationSystem.vue
│
├── layouts/            # Layout components
│   ├── AuthLayout.vue  # Layout untuk halaman auth
│   └── DashboardLayout.vue # Layout untuk dashboard
│
├── router/             # Vue Router configuration
│   └── index.ts        # Route definitions
│
├── stores/             # Pinia stores
│   ├── auth.ts         # Authentication store
│   ├── chat.ts         # Chat store
│   ├── notifications.ts # Notifications store
│   └── pageLoader.ts   # Page loading store
│
└── views/              # Page components
    ├── NotFoundView.vue # 404 page
    ├── analytics/      # Analytics pages
    │   └── AnalyticsView.vue
    ├── auth/          # Authentication pages
    │   ├── LoginView.vue
    │   └── RegisterView.vue
    ├── dashboard/     # Dashboard pages
    │   └── DashboardView.vue
    ├── profile/       # Profile pages
    │   └── ProfileView.vue
    ├── settings/      # Settings pages
    │   └── SettingsView.vue
    └── users/         # User management pages
        └── UsersView.vue
```

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   ```

4. **Build untuk production**
   ```bash
   npm run build
   ```

## 💻 Penggunaan

### Development
```bash
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm run preview      # Preview build production
npm run type-check   # Type checking
```

### Environment Variables
Buat file `.env` di root directory:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Vue Admin Dashboard
```

## 🧩 Komponen

### Charts
- **LineChart.vue**: Grafik garis untuk menampilkan trend data
- **DoughnutChart.vue**: Grafik donut untuk distribusi data

### Chat
- **ChatWidget.vue**: Widget chat dengan fitur minimize/expand

### Common
- **PageLoader.vue**: Loading indicator untuk perpindahan halaman

### Notifications
- **NotificationSystem.vue**: Sistem notifikasi global
- **NotificationDropdown.vue**: Dropdown untuk daftar notifikasi

## 🗄 Store Management

### Auth Store (`stores/auth.ts`)
- Mengelola state autentikasi user
- Login, logout, dan session management

### Chat Store (`stores/chat.ts`)
- Mengelola state chat dan messages
- User list dan active chat

### Notifications Store (`stores/notifications.ts`)
- Mengelola notifikasi aplikasi
- Add, remove, dan mark as read notifications

### Page Loader Store (`stores/pageLoader.ts`)
- Mengelola loading state saat perpindahan halaman
- Start/stop loading dengan custom message

## 🛣 Routing

Aplikasi menggunakan Vue Router dengan struktur:
- `/auth/*` - Halaman autentikasi (login, register)
- `/dashboard` - Dashboard utama
- `/analytics` - Halaman analytics
- `/users` - User management
- `/profile` - User profile
- `/settings` - Application settings

## 🎨 Styling

- **Vuetify**: Component library dengan Material Design
- **CSS Custom Properties**: Untuk theming
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Support untuk kedua tema

## 📱 PWA Features

- **Service Worker**: Caching dan offline support
- **Web App Manifest**: Installable web app
- **Icons**: App icons untuk berbagai ukuran
- **Auto Update**: Automatic updates untuk new versions

## 🔧 Configuration Files

- **vite.config.ts**: Vite configuration dengan PWA plugin
- **tsconfig.json**: TypeScript configuration
- **package.json**: Dependencies dan scripts

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan MIT License.

## 🆘 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.

---

**Dibuat dengan ❤️ menggunakan Vue 3 + TypeScript + Vuetify**