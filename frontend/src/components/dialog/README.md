# CustomDialog Component

Komponen dialog yang sangat fleksibel dan reusable untuk aplikasi Vue.js dengan Vuetify. Komponen ini menyediakan header dan footer yang dapat dikustomisasi, serta mendukung berbagai konfigurasi untuk berbagai kebutuhan UI.

## Features

- ✅ **Header yang dapat dikustomisasi** dengan title, subtitle, icon, dan actions
- ✅ **Footer yang fleksibel** dengan tombol default atau custom content
- ✅ **Slots untuk konten dinamis** - header actions, content, dan footer
- ✅ **Responsive design** dengan dukungan mobile
- ✅ **Dark theme support** 
- ✅ **Loading states** untuk async operations
- ✅ **Fullscreen mode** untuk konten yang membutuhkan ruang lebih
- ✅ **TypeScript support** dengan type safety
- ✅ **Accessibility** dengan proper ARIA attributes

## Basic Usage

```vue
<template>
  <CustomDialog
    v-model:show="dialogVisible"
    title="Dialog Title"
    subtitle="Optional subtitle"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <p>Your dialog content goes here</p>
  </CustomDialog>
</template>

<script setup>
import { ref } from 'vue'
import CustomDialog from '@/components/common/CustomDialog.vue'

const dialogVisible = ref(false)

const handleConfirm = () => {
  // Handle confirm action
  dialogVisible.value = false
}

const handleCancel = () => {
  // Handle cancel action
}
</script>
```

## Props

### Dialog Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | `false` | Controls dialog visibility |
| `maxWidth` | `string \| number` | `600` | Maximum width of dialog |
| `persistent` | `boolean` | `false` | Prevents closing on outside click |
| `scrollable` | `boolean` | `true` | Enables content scrolling |
| `fullscreen` | `boolean` | `false` | Makes dialog fullscreen |
| `transition` | `string` | `'dialog-transition'` | Dialog transition animation |
| `rounded` | `string \| number \| boolean` | `'lg'` | Border radius |

### Header Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showHeader` | `boolean` | `true` | Show/hide header section |
| `title` | `string` | `''` | Header title text |
| `subtitle` | `string` | `''` | Header subtitle text |
| `headerIcon` | `string` | `''` | Material Design icon name |
| `headerIconColor` | `string` | `'primary'` | Icon color |
| `headerIconSize` | `string \| number` | `24` | Icon size |
| `headerClass` | `string` | `''` | Additional CSS classes for header |
| `showHeaderDivider` | `boolean` | `true` | Show divider below header |

### Close Button Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCloseButton` | `boolean` | `true` | Show close button in header |
| `closeIcon` | `string` | `'mdi-close'` | Close button icon |
| `closeButtonTitle` | `string` | `'Close'` | Close button tooltip |

### Content Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contentClass` | `string` | `'pa-6'` | CSS classes for content area |
| `contentStyle` | `string \| object` | `''` | Inline styles for content area |

### Footer Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showFooter` | `boolean` | `true` | Show/hide footer section |
| `footerClass` | `string` | `'pa-4'` | CSS classes for footer |
| `showFooterDivider` | `boolean` | `true` | Show divider above footer |
| `footerJustifyStart` | `boolean` | `false` | Align footer content to start |

### Footer Buttons Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCancelButton` | `boolean` | `true` | Show cancel button |
| `cancelButtonText` | `string` | `'Cancel'` | Cancel button text |
| `cancelButtonColor` | `string` | `''` | Cancel button color |
| `cancelButtonVariant` | `string` | `'text'` | Cancel button variant |
| `showConfirmButton` | `boolean` | `true` | Show confirm button |
| `confirmButtonText` | `string` | `'Confirm'` | Confirm button text |
| `confirmButtonColor` | `string` | `'primary'` | Confirm button color |
| `confirmButtonVariant` | `string` | `'flat'` | Confirm button variant |
| `buttonSize` | `string` | `'default'` | Size for all buttons |
| `loading` | `boolean` | `false` | Show loading state on confirm button |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:show` | `boolean` | Emitted when dialog visibility changes |
| `close` | `void` | Emitted when close button is clicked |
| `cancel` | `void` | Emitted when cancel button is clicked |
| `confirm` | `void` | Emitted when confirm button is clicked |

## Slots

### Default Slot
Konten utama dialog.

```vue
<CustomDialog v-model:show="visible">
  <p>Your main content here</p>
</CustomDialog>
```

### Header Actions Slot
Tombol atau elemen tambahan di header.

```vue
<CustomDialog v-model:show="visible">
  <template #header-actions>
    <v-btn icon="mdi-help" size="small" variant="text" />
    <v-btn icon="mdi-settings" size="small" variant="text" />
  </template>
  
  <p>Content here</p>
</CustomDialog>
```

### Footer Slot
Footer kustom menggantikan tombol default.

```vue
<CustomDialog v-model:show="visible">
  <p>Content here</p>
  
  <template #footer>
    <v-card-actions>
      <v-spacer />
      <v-btn color="error" @click="deleteItem">Delete</v-btn>
      <v-btn color="primary" @click="saveItem">Save</v-btn>
    </v-card-actions>
  </template>
</CustomDialog>
```

## Examples

### 1. Confirmation Dialog

```vue
<CustomDialog
  v-model:show="confirmDialog"
  title="Delete Confirmation"
  subtitle="This action cannot be undone"
  header-icon="mdi-alert-circle"
  header-icon-color="error"
  confirm-button-text="Delete"
  confirm-button-color="error"
  cancel-button-text="Keep"
  max-width="400"
  @confirm="handleDelete"
>
  <div class="text-center py-4">
    <v-icon color="error" size="64" class="mb-4">mdi-delete-alert</v-icon>
    <p class="text-h6 mb-2">Are you sure?</p>
    <p class="text-body-2">This will permanently delete the item.</p>
  </div>
</CustomDialog>
```

### 2. Form Dialog

```vue
<CustomDialog
  v-model:show="formDialog"
  title="Add User"
  header-icon="mdi-account-plus"
  confirm-button-text="Save"
  :loading="saving"
  @confirm="saveUser"
>
  <v-form v-model="valid">
    <v-text-field
      v-model="user.name"
      label="Name"
      :rules="[rules.required]"
    />
    <v-text-field
      v-model="user.email"
      label="Email"
      :rules="[rules.required, rules.email]"
    />
  </v-form>
</CustomDialog>
```

### 3. Info Dialog (No Footer)

```vue
<CustomDialog
  v-model:show="infoDialog"
  title="Information"
  header-icon="mdi-information"
  :show-footer="false"
>
  <p>This is an information dialog without footer buttons.</p>
  <p>Use the X button to close.</p>
</CustomDialog>
```

### 4. Fullscreen Dialog

```vue
<CustomDialog
  v-model:show="fullscreenDialog"
  title="Detailed View"
  :fullscreen="true"
  confirm-button-text="Save Changes"
>
  <v-container fluid>
    <!-- Large content that needs full screen -->
  </v-container>
</CustomDialog>
```

### 5. Custom Header Actions

```vue
<CustomDialog
  v-model:show="customDialog"
  title="User Profile"
  header-icon="mdi-account"
>
  <template #header-actions>
    <v-btn icon="mdi-pencil" size="small" variant="text" @click="editMode = true" />
    <v-btn icon="mdi-share" size="small" variant="text" @click="shareProfile" />
  </template>
  
  <!-- Profile content -->
</CustomDialog>
```

## Styling

Komponen ini menggunakan CSS variables Vuetify untuk theming dan mendukung dark mode secara otomatis. Anda dapat menambahkan custom styling melalui props `headerClass`, `contentClass`, dan `footerClass`.

```vue
<CustomDialog
  header-class="custom-header"
  content-class="custom-content pa-8"
  footer-class="custom-footer"
>
  <!-- content -->
</CustomDialog>
```

## Accessibility

- Dialog menggunakan proper ARIA attributes
- Focus management untuk keyboard navigation
- Escape key untuk menutup dialog
- Screen reader friendly

## Best Practices

1. **Gunakan descriptive titles** - Berikan title yang jelas menggambarkan tujuan dialog
2. **Limit dialog size** - Jangan membuat dialog terlalu besar kecuali memang diperlukan
3. **Provide clear actions** - Gunakan label tombol yang jelas (Save, Delete, Cancel)
4. **Handle loading states** - Gunakan prop `loading` untuk operasi async
5. **Validate before confirm** - Validasi form sebelum emit confirm event
6. **Use appropriate icons** - Pilih icon yang sesuai dengan konteks dialog
7. **Consider mobile** - Test dialog di mobile devices

## Migration from v-dialog

Jika Anda menggunakan `v-dialog` sebelumnya:

```vue
<!-- Before -->
<v-dialog v-model="dialog" max-width="500">
  <v-card>
    <v-card-title>Title</v-card-title>
    <v-card-text>Content</v-card-text>
    <v-card-actions>
      <v-btn @click="dialog = false">Cancel</v-btn>
      <v-btn @click="confirm">OK</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- After -->
<CustomDialog
  v-model:show="dialog"
  title="Title"
  max-width="500"
  @confirm="confirm"
>
  Content
</CustomDialog>
```

## Demo

Lihat file `CustomDialogDemo.vue` untuk contoh lengkap penggunaan komponen ini dalam berbagai skenario.