<template>
  <v-card class="mb-6" rounded="lg">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            :model-value="search"
            @update:model-value="$emit('update:search', $event)"
            prepend-inner-icon="mdi-magnify"
            :label="searchLabel || 'Search...'"
            variant="outlined"
            hide-details
            clearable
          />
        </v-col>  
        
        <v-col 
          v-for="filter in filters" 
          :key="filter.key"
          cols="12" 
          :md="filter.cols || 3"
        >
          <v-select
            :model-value="filter.value"
            @update:model-value="$emit('update:filter', { key: filter.key, value: $event })"
            :items="filter.items"
            :label="filter.label"
            variant="outlined"
            hide-details
            clearable
          />
        </v-col>
        
        <v-col cols="12" md="2" v-if="showExport">
          <v-btn
            color="primary"
            variant="outlined"
            block
            @click="$emit('export')"
          >
            Export
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Filter {
  key: string
  label: string
  items: string[] | { title: string; value: string }[]
  value: string
  cols?: number
}

interface Props {
  search: string
  searchLabel?: string
  filters: Filter[]
  showExport?: boolean
}

defineProps<Props>()
defineEmits<{
  'update:search': [value: string]
  'update:filter': [payload: { key: string; value: string }]
  export: []
}>()
</script>