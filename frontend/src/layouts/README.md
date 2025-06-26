# Dashboard Layout System

## Overview

Sistem layout dashboard yang telah ditingkatkan dengan implementasi max-width yang fleksibel menggunakan CSS Custom Properties untuk memberikan kontrol yang lebih baik terhadap lebar konten di berbagai ukuran layar.

## Fitur Utama

### 1. CSS Custom Properties untuk Konfigurasi Layout

Sistem menggunakan CSS custom properties yang dapat dikustomisasi:

```css
:root {
  /* Content Width Variables */
  --content-max-width-xs: 100%;
  --content-max-width-sm: 100%;
  --content-max-width-md: 100%;
  --content-max-width-lg: 1200px;
  --content-max-width-xl: 1400px;
  --content-max-width-2xl: 1600px;
  
  /* Content Padding Variables */
  --content-padding-xs: 12px;
  --content-padding-sm: 16px;
  --content-padding-md: 20px;
  --content-padding-lg: 24px;
  --content-padding-xl: 32px;
  --content-padding-2xl: 40px;
}
```

### 2. Responsive Breakpoints

Sistem mendukung 6 breakpoint responsif:

- **Extra Small (XS)**: < 480px (phones)
- **Small (SM)**: 480px - 767px (large phones)
- **Medium (MD)**: 768px - 1023px (tablets)
- **Large (LG)**: 1024px - 1279px (small desktops)
- **Extra Large (XL)**: 1280px - 1439px (large desktops)
- **2X Large (2XL)**: ≥ 1440px (very large desktops)
- **Ultra Wide**: ≥ 2560px (ultra-wide displays)

### 3. Utility Classes

#### Content Width Variants

```css
/* Narrow content for reading-focused layouts */
.content-narrow {
  --content-max-width-lg: 800px;
  --content-max-width-xl: 1000px;
  --content-max-width-2xl: 1200px;
}

/* Wide content for data-heavy layouts */
.content-wide {
  --content-max-width-lg: 1400px;
  --content-max-width-xl: 1600px;
  --content-max-width-2xl: 1800px;
}

/* Full width content */
.content-full {
  --content-max-width-xs: 100%;
  --content-max-width-sm: 100%;
  --content-max-width-md: 100%;
  --content-max-width-lg: 100%;
  --content-max-width-xl: 100%;
  --content-max-width-2xl: 100%;
}
```

#### Padding Variants

```css
/* Compact padding for dense layouts */
.content-compact {
  --content-padding-xs: 8px;
  --content-padding-sm: 12px;
  --content-padding-md: 16px;
  --content-padding-lg: 20px;
  --content-padding-xl: 24px;
  --content-padding-2xl: 28px;
}

/* Spacious padding for comfortable layouts */
.content-spacious {
  --content-padding-xs: 16px;
  --content-padding-sm: 20px;
  --content-padding-md: 28px;
  --content-padding-lg: 36px;
  --content-padding-xl: 44px;
  --content-padding-2xl: 52px;
}
```

#### Layout Variants

```css
/* Centered content */
.main-content.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Full height content */
.main-content.full-height {
  min-height: calc(100vh - 56px);
}
```

## Cara Penggunaan

### 1. Menggunakan Layout Default

Layout default sudah dikonfigurasi dengan max-width yang optimal untuk sebagian besar kasus penggunaan:

```vue
<template>
  <DashboardLayout>
    <YourPageContent />
  </DashboardLayout>
</template>
```

### 2. Menggunakan Utility Classes

#### Untuk halaman dengan konten yang banyak teks (artikel, dokumentasi):

```vue
<template>
  <DashboardLayout class="content-narrow">
    <ArticleContent />
  </DashboardLayout>
</template>
```

#### Untuk halaman dengan tabel atau dashboard yang lebar:

```vue
<template>
  <DashboardLayout class="content-wide">
    <DataTable />
  </DashboardLayout>
</template>
```

#### Untuk halaman yang membutuhkan lebar penuh:

```vue
<template>
  <DashboardLayout class="content-full">
    <FullWidthChart />
  </DashboardLayout>
</template>
```

#### Untuk layout yang lebih kompak:

```vue
<template>
  <DashboardLayout class="content-compact">
    <CompactForm />
  </DashboardLayout>
</template>
```

### 3. Kustomisasi dengan CSS Custom Properties

Anda dapat mengoverride variabel CSS untuk kebutuhan spesifik:

```vue
<template>
  <DashboardLayout class="custom-layout">
    <CustomContent />
  </DashboardLayout>
</template>

<style>
.custom-layout {
  --content-max-width-lg: 900px;
  --content-max-width-xl: 1100px;
  --content-padding-lg: 28px;
}
</style>
```

### 4. Kombinasi Multiple Classes

```vue
<template>
  <DashboardLayout class="content-wide content-spacious">
    <LuxuriousDataDashboard />
  </DashboardLayout>
</template>
```

## Best Practices

### 1. Pemilihan Layout Berdasarkan Konten

- **content-narrow**: Untuk halaman dengan banyak teks (artikel, dokumentasi, form sederhana)
- **content-wide**: Untuk dashboard, tabel data, atau konten yang membutuhkan ruang horizontal
- **content-full**: Untuk visualisasi data, peta, atau konten yang membutuhkan lebar penuh
- **default**: Untuk halaman umum dengan campuran konten

### 2. Pemilihan Padding

- **content-compact**: Untuk aplikasi dengan kepadatan informasi tinggi
- **content-spacious**: Untuk aplikasi yang mengutamakan kenyamanan visual
- **default**: Untuk keseimbangan antara efisiensi ruang dan kenyamanan

### 3. Konsistensi

- Gunakan utility classes yang konsisten di seluruh aplikasi
- Dokumentasikan pilihan layout untuk setiap jenis halaman
- Pertimbangkan pengalaman pengguna di berbagai ukuran layar

### 4. Performance

- Sistem menggunakan CSS custom properties yang efisien
- Transisi smooth untuk perubahan responsif
- Optimasi untuk print media

## Migrasi dari Sistem Lama

Jika Anda memiliki komponen yang menggunakan sistem lama:

```css
/* Lama */
.main-content {
  max-width: 1400px;
  padding: 32px;
}

/* Baru */
.main-content {
  max-width: var(--content-max-width-xl);
  padding: var(--content-padding-xl);
}
```

## Troubleshooting

### Layout tidak responsif dengan benar

1. Pastikan tidak ada CSS yang mengoverride dengan `!important`
2. Periksa apakah ada konflik dengan CSS framework lain
3. Gunakan browser dev tools untuk memverifikasi nilai custom properties

### Konten terlalu lebar atau sempit

1. Periksa utility class yang digunakan
2. Pertimbangkan untuk menggunakan kombinasi classes
3. Override custom properties jika diperlukan

### Performance issues

1. Hindari menggunakan terlalu banyak custom properties override
2. Gunakan utility classes yang sudah tersedia
3. Pertimbangkan untuk menambahkan utility class baru jika pattern sering digunakan

## Kontribusi

Untuk menambahkan utility class baru atau memodifikasi sistem:

1. Tambahkan custom properties di `:root`
2. Buat utility class yang sesuai
3. Update dokumentasi ini
4. Test di berbagai ukuran layar
5. Pastikan backward compatibility

## Changelog

### v2.0.0 (Current)
- Implementasi CSS Custom Properties
- Enhanced responsive breakpoints
- Utility classes untuk width dan padding variants
- Support untuk ultra-wide displays
- Print media optimization
- Smooth transitions untuk responsive changes

### v1.0.0 (Legacy)
- Basic max-width implementation
- Simple responsive breakpoints
- Fixed padding values