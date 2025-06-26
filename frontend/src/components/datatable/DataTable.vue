<template>
  <n-card class="data-table-card">
    <n-data-table
      :columns="tableColumns"
      :data="filteredItems"
      :loading="loading"
      :pagination="paginationConfig"
      :row-key="rowKeyFunction"
      striped
    />
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NDataTable, NAvatar, NTag, NButton, NIcon } from 'naive-ui'
import { computed, h } from 'vue'
import type { DataTableColumns } from 'naive-ui'

interface TableHeader {
  title: string
  key: string
  sortable?: boolean
  align?: string
  width?: string | number
}

interface TableAction {
  key: string
  icon: string
  color: string
  title: string
}

interface Props {
  headers: TableHeader[]
  items: any[]
  search?: string
  loading?: boolean
  itemValue?: string
  itemsPerPage?: number
  actions?: TableAction[]
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  loading: false,
  itemValue: 'id',
  itemsPerPage: 10,
  actions: () => []
})

const emit = defineEmits<{
  action: [payload: { action: string; item: any }]
}>()

// Row key function for n-data-table
const rowKeyFunction = (row: any) => row[props.itemValue]

// Computed properties
const filteredItems = computed(() => {
  if (!props.search) return props.items
  
  const searchLower = props.search.toLowerCase()
  return props.items.filter(item => {
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchLower)
    )
  })
})

const tableColumns = computed((): DataTableColumns => {
  const columns = props.headers.map(header => ({
    title: header.title,
    key: header.key,
    sortable: header.sortable !== false,
    align: header.align || 'left',
    width: header.width,
    render: (row: any) => {
      // Custom rendering for specific columns
      if (header.key === 'profile_picture') {
        return h(NAvatar, {
          size: 40,
          src: row.profile_picture,
          fallbackSrc: '/default-avatar.png'
        })
      }
      
      if (header.key === 'active') {
        return h(NTag, {
          type: row.active ? 'success' : 'error',
          size: 'small'
        }, () => row.active ? 'Active' : 'Inactive')
      }
      
      if (header.key === 'verified') {
        return h(NTag, {
          type: row.verified ? 'success' : 'warning',
          size: 'small'
        }, () => row.verified ? 'Verified' : 'Pending')
      }
      
      if (header.key === 'role') {
        return h(NTag, {
          type: getRoleTagType(row.role),
          size: 'small'
        }, () => row.role)
      }
      
      if (header.key === 'last_login') {
        return formatDate(row.last_login)
      }
      
      if (header.key === 'actions' && props.actions.length > 0) {
        return h('div', { class: 'action-buttons' }, 
          props.actions.map(action => 
            h(NButton, {
              size: 'small',
              type: getButtonType(action.color),
              text: true,
              circle: true,
              title: action.title,
              onClick: () => emit('action', { action: action.key, item: row })
            }, () => h(NIcon, () => getIconComponent(action.icon)))
          )
        )
      }
      
      return row[header.key]
    }
  }))
  
  return columns
})

const paginationConfig = computed(() => ({
  pageSize: props.itemsPerPage,
  showSizePicker: true,
  pageSizes: [5, 10, 20, 50],
  showQuickJumper: true
}))

// Helper functions
const getRoleTagType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'error',
    moderator: 'warning',
    user: 'info',
    viewer: 'default'
  }
  return types[role] || 'default'
}

const getButtonType = (color: string) => {
  switch (color) {
    case 'primary': return 'primary'
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'info': return 'info'
    default: return 'default'
  }
}

const getIconComponent = (iconName: string) => {
  // Map common MDI icons to SVG paths
  const iconMap: Record<string, string> = {
    'mdi-pencil': 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
    'mdi-delete': 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
    'mdi-eye': 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z',
    'mdi-dots-vertical': 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z'
  }
  
  const path = iconMap[iconName] || iconMap['mdi-dots-vertical']
  
  return h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    width: '16px',
    height: '16px'
  }, [
    h('path', { d: path })
  ])
}

const formatDate = (date: string | Date) => {
  if (!date) return 'Never'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.data-table-card {
  border-radius: 12px;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* Custom styling for Naive UI DataTable */
:deep(.n-data-table) {
  --n-th-padding: 12px 16px;
  --n-td-padding: 12px 16px;
}

:deep(.n-data-table-th) {
  font-weight: 600;
  background-color: var(--n-table-header-color);
  border-bottom: 1px solid var(--n-border-color);
}

:deep(.n-data-table-td) {
  border-bottom: 1px solid var(--n-border-color);
}

:deep(.n-data-table-tr:hover .n-data-table-td) {
  background-color: var(--n-table-header-color);
}

/* Avatar styling */
:deep(.n-avatar) {
  border: 2px solid var(--n-border-color);
}

/* Tag styling */
:deep(.n-tag) {
  font-weight: 500;
}

/* Button styling */
:deep(.n-button) {
  transition: all 0.2s ease;
}

:deep(.n-button:hover) {
  transform: scale(1.1);
}

/* Responsive design */
@media (max-width: 768px) {
  :deep(.n-data-table) {
    --n-th-padding: 8px 12px;
    --n-td-padding: 8px 12px;
  }
  
  .action-buttons {
    gap: 2px;
  }
}
</style>