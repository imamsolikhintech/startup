<template>
  <v-card rounded="lg">
    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :loading="loading"
      class="elevation-0"
      :item-value="itemValue"
      :items-per-page="itemsPerPage"
    >
      <!-- Dynamic slots for custom item rendering -->
      <template 
        v-for="header in headers.filter(h => h.key && slots[`item.${h.key}`])"
        :key="header.key"
        #[`item.${header.key}`]="{ item }"
      >
        <slot :name="`item.${header.key}`" :item="item"></slot>
      </template>
      
      <!-- Default avatar slot -->
      <template #item.profile_picture="{ item }" v-if="!slots['item.profile_picture']">
        <v-avatar size="40">
          <v-img :src="item.profile_picture" :alt="item.name" />
        </v-avatar>
      </template>

      <!-- Default status slot -->
      <template #item.active="{ item }" v-if="!slots['item.active']">
        <v-chip
          :color="item.active ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          {{ item.active ? 'Active' : 'Inactive' }}
        </v-chip>
      </template>

      <!-- Default verified slot -->
      <template #item.verified="{ item }" v-if="!slots['item.verified']">
        <v-chip
          :color="item.verified ? 'success' : 'warning'"
          size="small"
          variant="tonal"
          :prepend-icon="item.verified ? 'mdi-check-circle' : 'mdi-clock-outline'"
        >
          {{ item.verified ? 'Verified' : 'Pending' }}
        </v-chip>
      </template>

      <!-- Default role slot -->
      <template #item.role="{ item }" v-if="!slots['item.role']">
        <v-chip
          :color="getRoleColor(item.role)"
          size="small"
          variant="tonal"
        >
          {{ item.role }}
        </v-chip>
      </template>

      <!-- Default date slot -->
      <template #item.last_login="{ item }" v-if="!slots['item.last_login']">
        {{ formatDate(item.last_login) }}
      </template>

      <!-- Default actions slot -->
      <template #item.actions="{ item }" v-if="!slots['item.actions'] && actions.length > 0">
        <v-btn
          v-for="action in actions"
          :key="action.key"
          :icon="action.icon"
          size="small"
          :color="action.color"
          variant="text"
          @click="$emit('action', { action: action.key, item })"
          :title="action.title"
        />
      </template>

      <!-- Pass through other slots -->
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
        <slot :name="name" v-bind="slotData"></slot>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'

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

withDefaults(defineProps<Props>(), {
  search: '',
  loading: false,
  itemValue: 'id',
  itemsPerPage: 10,
  actions: () => []
})

defineEmits<{
  action: [payload: { action: string; item: any }]
}>()

const slots = useSlots()

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'error',
    moderator: 'warning',
    user: 'primary',
    viewer: 'info'
  }
  return colors[role] || 'primary'
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