# Base Components

Optimized and reusable UI components following clean code principles and design system standards.

## Components

### StatsCard

A unified statistics card component that supports both single and multiple statistics display.

#### Features

- **Single & Multiple Modes**: Display one stat or multiple stats in a grid/row/column layout
- **Flexible Layouts**: Grid (1-4 columns), row, or column arrangements
- **Variants**: Default, primary, success, warning, error, info
- **Sizes**: Small, medium, large
- **Progress Indicators**: Optional progress bars with custom colors
- **Trend Indicators**: Up, down, or neutral trends with icons
- **Icons**: Centralized icon management through iconService
- **Responsive**: Mobile-first responsive design
- **Accessibility**: ARIA labels and keyboard navigation support

#### Usage

```vue
<template>
  <!-- Single stat -->
  <StatsCard
    title="Total Users"
    :value="1234"
    subtitle="Active users"
    icon="mdi-account-group"
    variant="primary"
    :progress="75"
    trend="up"
    change="+12%"
  />

  <!-- Multiple stats -->
  <StatsCard
    :stats="statsData"
    multiple
    layout="grid"
    size="medium"
    gap="medium"
  />
</template>

<script setup>
import { StatsCard } from '@/components/base'

const statsData = [
  {
    title: 'Total Users',
    value: 1234,
    icon: 'mdi-account-group',
    variant: 'primary'
  },
  {
    title: 'Revenue',
    value: '$45,678',
    icon: 'mdi-currency-usd',
    variant: 'success',
    progress: 85,
    trend: 'up',
    change: '+15%'
  }
]
</script>
```

#### Props

##### Single Mode Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `''` | Card title |
| `value` | `number \| string` | `0` | Main value to display |
| `subtitle` | `string` | `''` | Optional subtitle |
| `icon` | `string` | `''` | Icon name (MDI format) |
| `iconColor` | `string` | `''` | Custom icon color |
| `progress` | `number` | `undefined` | Progress percentage (0-100) |
| `progressColor` | `string` | `'var(--color-primary-500)'` | Progress bar color |
| `trend` | `'up' \| 'down' \| 'neutral'` | `undefined` | Trend direction |
| `change` | `string` | `''` | Change text (e.g., "+12%") |

##### Multiple Mode Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | `StatItem[]` | `[]` | Array of stat items |
| `multiple` | `boolean` | `false` | Enable multiple stats mode |
| `layout` | `'grid' \| 'row' \| 'column' \| 'grid-1' \| 'grid-2' \| 'grid-3' \| 'grid-4'` | `'grid'` | Layout type |
| `gap` | `'small' \| 'medium' \| 'large'` | `'medium'` | Gap between cards |

##### Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Card size |
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Card variant/theme |
| `loading` | `boolean` | `false` | Show loading state |

#### StatItem Interface

```typescript
interface StatItem {
  id?: string | number
  title: string
  value: number | string
  subtitle?: string
  icon?: string
  iconColor?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  progress?: number
  progressColor?: string
  trend?: 'up' | 'down' | 'neutral'
  change?: string
}
```

#### CSS Classes

The component uses BEM methodology with the following structure:

- `.stats-card` - Main card block
- `.stats-card__header` - Header section
- `.stats-card__content` - Main content area
- `.stats-card__progress` - Progress bar container
- `.stats-card__footer` - Footer section
- `.stats-cards` - Multiple cards container

Modifiers:
- `.stats-card--small`, `.stats-card--large` - Size variants
- `.stats-card--primary`, `.stats-card--success`, etc. - Color variants
- `.stats-card--loading` - Loading state

#### Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode support
- Reduced motion support

#### Dependencies

- `@/services/icons/iconService` - Icon management
- `@/services/formatting/numberFormatter` - Number formatting
- `@/assets/styles/components/stats-card.css` - Component styles

## Installation

```typescript
import { installBaseComponents } from '@/components/base'

// Install all base components globally
installBaseComponents(app)

// Or import individually
import { StatsCard } from '@/components/base'
```

## Design System Integration

These components are built with the design system tokens:

- **Colors**: Uses design token color palette
- **Typography**: Follows typography scale
- **Spacing**: Uses consistent spacing system
- **Breakpoints**: Responsive design with mobile-first approach
- **Animations**: Smooth transitions and hover effects

## Migration Guide

If migrating from the old `StatsCards` component:

1. Replace `StatsCards` with `StatsCard`
2. Add `multiple` prop for multiple stats
3. Change `color` prop to `variant`
4. Update stat objects to use new `StatItem` interface

```vue
<!-- Old -->
<StatsCards :stats="stats" />

<!-- New -->
<StatsCard :stats="stats" multiple />
```