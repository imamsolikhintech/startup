<template>
  <header class="page-header">
    <!-- Breadcrumbs -->
    <nav
      v-if="breadcrumbs && breadcrumbs.length > 0"
      class="page-header__breadcrumbs">
      <ol class="breadcrumbs">
        <li
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
          class="breadcrumbs__item">
          <router-link
            v-if="crumb.to"
            :to="crumb.to"
            class="breadcrumbs__link">
            {{ crumb.label }}
          </router-link>
          <span
            v-else
            class="breadcrumbs__current">{{ crumb.label }}</span>
          <span
            v-if="index < breadcrumbs.length - 1"
            class="breadcrumbs__separator">/</span>
        </li>
      </ol>
    </nav>

    <!-- Main header content -->
    <div class="page-header__content">
      <div class="page-header__text">
        <div class="page-header__title-wrapper">
          <h1 class="page-header__title">
            {{ title }}
          </h1>
          <div
            v-if="status"
            :class="`page-header__status page-header__status--${status}`">
            <span class="page-header__status-indicator"></span>
            <span class="page-header__status-text">{{ status }}</span>
          </div>
        </div>
        <p
          v-if="subtitle"
          class="page-header__subtitle">
          {{ subtitle }}
        </p>
        <div
          v-if="meta"
          class="page-header__meta">
          {{ meta }}
        </div>
      </div>

      <div
        v-if="actions && actions.length > 0"
        class="page-header__actions">
        <button
          v-for="action in actions"
          :key="action.key"
          :class="[
            'page-header__action',
            `page-header__action--${action.variant || 'primary'}`,
            `page-header__action--${action.size || 'medium'}`,
            {
              'page-header__action--disabled': action.disabled,
              'page-header__action--loading': action.loading
            }
          ]"
          :disabled="action.disabled || action.loading"
          @click="$emit('action', action.key)">
          <component
            :is="iconService.getIconComponent(action.icon)"
            v-if="action.icon && !action.loading"
            class="page-header__action-icon" />
          <div
            v-if="action.loading"
            class="page-header__action-spinner"></div>
          <span class="page-header__action-text">{{ action.label }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { useIconService } from '@/utils/iconService'

  interface Action {
    key: string,
    label: string,
    icon?: string,
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger',
    size?: 'small' | 'medium' | 'large',
    disabled?: boolean,
    loading?: boolean,
  }

  interface Props {
    title: string,
    subtitle?: string,
    actions?: Action[],
    breadcrumbs?: Array<{ label: string, to?: string }>,
    meta?: string,
    status?: 'active' | 'inactive' | 'pending' | 'error',
  }

  defineProps<Props>()
  defineEmits<{
    action: [key: string],
  }>()

  // Services
  const iconService = useIconService()
</script>

<style scoped>
/* Use the BEM classes from page-header.css */
@import '@/assets/styles/components/page-header.css';
</style>
