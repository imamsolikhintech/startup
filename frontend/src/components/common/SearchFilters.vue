<template>
  <n-card class="search-filters">
    <div class="filters-grid">
      <div class="search-field">
        <n-input
          :value="search"
          :placeholder="searchLabel || 'Search...'"
          clearable
          @update:value="$emit('update:search', $event)">
          <template #prefix>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
            </n-icon>
          </template>
        </n-input>
      </div>

      <div
        v-for="filter in filters"
        :key="filter.key"
        class="filter-field"
        :class="`filter-cols-${filter.cols || 3}`">
        <n-select
          :value="filter.value"
          :options="formatSelectItems(filter.items)"
          :placeholder="filter.label"
          clearable
          @update:value="$emit('update:filter', { key: filter.key, value: $event })" />
      </div>

      <div
        v-if="showExport"
        class="export-field">
        <n-button
          type="primary"
          secondary
          block
          @click="$emit('export')">
          Export
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
  import { NButton, NCard, NIcon, NInput, NSelect } from 'naive-ui'

  interface Filter {
    key: string,
    label: string,
    items: string[] | { title: string, value: string }[],
    value: string,
    cols?: number,
  }

  interface Props {
    search: string,
    searchLabel?: string,
    filters: Filter[],
    showExport?: boolean,
  }

  defineProps<Props>()
  defineEmits<{
    'update:search': [value: string],
    'update:filter': [payload: { key: string, value: string }],
    export: [],
  }>()

  const formatSelectItems = (items: string[] | { title: string, value: string }[]) => {
    if (Array.isArray(items) && items.length > 0) {
      if (typeof items[0] === 'string') {
        return (items as string[]).map(item => ({ label: item, value: item }))
      } else {
        return (items as { title: string, value: string }[]).map(item => ({ label: item.title, value: item.value }))
      }
    }
    return []
  }
</script>

<style scoped>
.search-filters {
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .filters-grid {
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    align-items: end;
  }

  .search-field {
    grid-column: 1;
  }

  .filter-field {
    grid-column: span 1;
  }

  .filter-cols-2 {
    grid-column: span 2;
  }

  .filter-cols-3 {
    grid-column: span 1;
  }

  .filter-cols-4 {
    grid-column: span 1;
  }

  .export-field {
    grid-column: -1;
    min-width: 120px;
  }
}

@media (max-width: 767px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .search-field,
  .filter-field,
  .export-field {
    grid-column: 1;
  }
}
</style>
