<template>
  <div class="analytics-view">
    <div class="header-section mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold mb-2">Analytics Dashboard</h1>
          <p class="text-gray-600">
            Track your performance and insights
          </p>
        </div>
        <n-button-group>
          <n-button :type="selectedPeriod === '7' ? 'primary' : 'default'" @click="selectedPeriod = '7'">7 Days</n-button>
          <n-button :type="selectedPeriod === '30' ? 'primary' : 'default'" @click="selectedPeriod = '30'">30 Days</n-button>
          <n-button :type="selectedPeriod === '90' ? 'primary' : 'default'" @click="selectedPeriod = '90'">90 Days</n-button>
        </n-button-group>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid mb-6">
      <n-card v-for="metric in metrics" :key="metric.title" class="metric-card">
        <div class="metric-content p-4">
          <div class="flex items-center justify-between mb-3">
            <n-icon :size="32" :color="getMetricColor(metric.color)">
              <component :is="getMetricIcon(metric.icon)" />
            </n-icon>
            <n-tag :type="metric.trend === 'up' ? 'success' : 'error'" size="small">
              <template #icon>
                <n-icon :size="16">
                  <component :is="getTrendIcon(metric.trend)" />
                </n-icon>
              </template>
              {{ metric.change }}
            </n-tag>
          </div>
          
          <div class="text-2xl font-bold mb-1">{{ metric.value }}</div>
          <div class="text-sm text-gray-600">{{ metric.title }}</div>
          
          <div class="mt-3">
            <n-progress
              :percentage="metric.progress"
              :color="getMetricColor(metric.color)"
              :height="4"
              :border-radius="2"
              :fill-border-radius="2"
            />
          </div>
        </div>
      </n-card>
    </div>

    <!-- Charts Row -->
    <div class="charts-row mb-6">
      <!-- Traffic Chart -->
      <div class="traffic-chart">
        <n-card class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold">Website Traffic</span>
              <n-button-group size="small">
                <n-button :type="trafficView === 'visits' ? 'primary' : 'default'" @click="trafficView = 'visits'">Visits</n-button>
                <n-button :type="trafficView === 'pageviews' ? 'primary' : 'default'" @click="trafficView = 'pageviews'">Pageviews</n-button>
                <n-button :type="trafficView === 'users' ? 'primary' : 'default'" @click="trafficView = 'users'">Users</n-button>
              </n-button-group>
            </div>
          </template>
          <LineChart :data="trafficChartData" :options="chartOptions" />
        </n-card>
      </div>

      <!-- Device Breakdown -->
      <div class="device-chart">
        <n-card class="h-full">
          <template #header>
            <span class="text-lg font-semibold">Device Breakdown</span>
          </template>
          <DoughnutChart :data="deviceData" :options="doughnutOptions" />
          
          <div class="device-list mt-4">
            <div
              v-for="(device, index) in deviceBreakdown"
              :key="device.name"
              class="device-item flex items-center justify-between py-2"
            >
              <div class="flex items-center">
                <div 
                  class="device-indicator w-3 h-3 rounded-full mr-3"
                  :style="{ backgroundColor: deviceColors[index] }"
                ></div>
                <span class="text-sm">{{ device.name }}</span>
              </div>
              <span class="text-sm font-medium">{{ device.percentage }}%</span>
            </div>
          </div>
         </n-card>
       </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="analytics-details">
      <!-- Top Pages -->
      <div class="top-pages">
        <n-card>
          <template #header>
            <span class="text-lg font-semibold">Top Pages</span>
          </template>
          <div class="page-list">
            <div
              v-for="page in topPages"
              :key="page.path"
              class="page-item flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div>
                <div class="text-sm font-medium">{{ page.path }}</div>
                <div class="text-xs text-gray-500">{{ page.views }} views</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{{ page.bounce }}%</div>
                <div class="text-xs text-gray-500">bounce</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Geographic Data -->
      <div class="geo-data">
        <n-card>
          <template #header>
            <span class="text-lg font-semibold">Geographic Distribution</span>
          </template>
          <div class="geo-list">
            <div
              v-for="country in geoData"
              :key="country.code"
              class="geo-item flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div class="flex items-center">
                <div class="country-flag text-lg mr-3">{{ country.flag }}</div>
                <span class="text-sm font-medium">{{ country.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{{ country.users }}</div>
                <div class="text-xs text-gray-500">users</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'

interface MetricItem {
  title: string
  value: string
  icon: string
  color: string
  trend: 'up' | 'down'
  change: string
  progress: number
}

const selectedPeriod = ref('30')
const trafficView = ref('visits')

const metrics: MetricItem[] = [
  {
    title: 'Total Visitors',
    value: '24,532',
    icon: 'mdi-account-multiple',
    color: 'primary',
    trend: 'up',
    change: '+12.5%',
    progress: 75
  },
  {
    title: 'Page Views',
    value: '87,943',
    icon: 'mdi-chart-line',
    color: 'success',
    trend: 'up',
    change: '+8.2%',
    progress: 82
  },
  {
    title: 'Bounce Rate',
    value: '32.4%',
    icon: 'mdi-exit-to-app',
    color: 'warning',
    trend: 'down',
    change: '-2.1%',
    progress: 32
  },
  {
    title: 'Avg. Session',
    value: '2m 34s',
    icon: 'mdi-clock',
    color: 'info',
    trend: 'up',
    change: '+15s',
    progress: 60
  }
]

const trafficChartData = computed(() => ({
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Current Period',
      data: [8200, 9500, 7800, 10200],
      borderColor: '#1976D2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: 'Previous Period',
      data: [7500, 8200, 6900, 8800],
      borderColor: '#424242',
      backgroundColor: 'rgba(66, 66, 66, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const deviceBreakdown = [
  { name: 'Desktop', percentage: 58.4 },
  { name: 'Mobile', percentage: 32.1 },
  { name: 'Tablet', percentage: 9.5 }
]

const deviceColors = ['#1976D2', '#4CAF50', '#FF9800']

const deviceData = {
  labels: deviceBreakdown.map(d => d.name),
  datasets: [
    {
      data: deviceBreakdown.map(d => d.percentage),
      backgroundColor: deviceColors,
      borderWidth: 0
    }
  ]
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  cutout: '70%'
}

const topPages = [
  { path: '/dashboard', views: 12543, bounce: 25.4 },
  { path: '/products', views: 8932, bounce: 31.2 },
  { path: '/about', views: 6421, bounce: 45.8 },
  { path: '/contact', views: 4123, bounce: 38.9 },
  { path: '/blog', views: 3241, bounce: 42.1 }
]

const geoData = [
  { code: 'US', name: 'United States', flag: '🇺🇸', users: 8542 },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', users: 3241 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', users: 2891 },
  { code: 'FR', name: 'France', flag: '🇫🇷', users: 2156 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', users: 1823 }
]

// Helper functions for icons and colors
const getMetricIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'mdi-account-multiple': () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6H10V8H6V6M6,10H10V12H6V10M6,14H10V16H6V14Z' })),
    'mdi-chart-line': () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z' })),
    'mdi-exit-to-app': () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.42L12.67,11H3V13H12.67L10.08,15.58Z' })),
    'mdi-clock': () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z' }))
  }
  return iconMap[iconName] || (() => h('div'))
}

const getTrendIcon = (trend: string) => {
  return trend === 'up' 
    ? () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z' }))
    : () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z' }))
}

const getMetricColor = (color: string) => {
  const colorMap: Record<string, string> = {
    'primary': '#1976D2',
    'success': '#4CAF50',
    'warning': '#FF9800',
    'info': '#2196F3',
    'error': '#F44336'
  }
  return colorMap[color] || '#1976D2'
}
</script>

<style scoped>
.analytics-view {
  padding: 0;
}

.header-section {
  margin-bottom: 24px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.metric-content {
  padding: 16px;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.traffic-chart,
.device-chart {
  min-height: 400px;
}

.device-list {
  margin-top: 16px;
}

.device-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.device-item:last-child {
  border-bottom: none;
}

.device-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
}

.analytics-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.page-list,
.geo-list {
  padding: 0;
}

.page-item,
.geo-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.page-item:last-child,
.geo-item:last-child {
  border-bottom: none;
}

.country-flag {
  font-size: 18px;
  margin-right: 12px;
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-details {
    grid-template-columns: 1fr;
  }
  
  .header-section .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

/* Button group styling */
.n-button-group .n-button {
  transition: all 0.2s ease;
}

.n-button-group .n-button:hover {
  transform: translateY(-1px);
}

/* Card styling */
.n-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.n-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Progress styling */
.n-progress {
  border-radius: 2px;
}

/* Tag styling */
.n-tag {
  font-weight: 500;
}

/* Utility classes */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-gray-600 {
  color: #6b7280;
}

.text-gray-500 {
  color: #9ca3af;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.w-3 {
  width: 0.75rem;
}

.h-3 {
  height: 0.75rem;
}

.h-full {
  height: 100%;
}

.rounded-full {
  border-radius: 9999px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-gray-100 {
  border-color: #f3f4f6;
}

.last\:border-b-0:last-child {
  border-bottom-width: 0;
}

.text-right {
  text-align: right;
}
</style>

