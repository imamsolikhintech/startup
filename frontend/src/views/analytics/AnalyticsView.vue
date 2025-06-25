<template>
  <div class="analytics-view">
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Analytics Dashboard</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Track your performance and insights
            </p>
          </div>
          <v-btn-toggle v-model="selectedPeriod" mandatory>
            <v-btn value="7">7 Days</v-btn>
            <v-btn value="30">30 Days</v-btn>
            <v-btn value="90">90 Days</v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
    </v-row>

    <!-- Key Metrics -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="metric in metrics" :key="metric.title">
        <v-card rounded="lg" elevation="2" class="metric-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <v-icon :color="metric.color" size="32">{{ metric.icon }}</v-icon>
              <v-chip
                :color="metric.trend === 'up' ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                <v-icon
                  :icon="metric.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'"
                  size="16"
                  class="mr-1"
                />
                {{ metric.change }}
              </v-chip>
            </div>
            
            <div class="text-h4 font-weight-bold mb-1">{{ metric.value }}</div>
            <div class="text-subtitle-2 text-medium-emphasis">{{ metric.title }}</div>
            
            <!-- Mini sparkline would go here -->
            <div class="mt-3">
              <v-progress-linear
                :model-value="metric.progress"
                :color="metric.color"
                height="4"
                rounded
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row class="mb-6">
      <!-- Traffic Chart -->
      <v-col cols="12" lg="8">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6">Website Traffic</span>
            <v-btn-toggle v-model="trafficView" size="small">
              <v-btn value="visits">Visits</v-btn>
              <v-btn value="pageviews">Pageviews</v-btn>
              <v-btn value="users">Users</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <LineChart :data="trafficChartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Device Breakdown -->
      <v-col cols="12" lg="4">
        <v-card rounded="lg" elevation="2" class="h-100">
          <v-card-title>Device Breakdown</v-card-title>
          <v-card-text>
            <DoughnutChart :data="deviceData" :options="doughnutOptions" />
            
            <v-list class="mt-4" density="compact">
              <v-list-item
                v-for="(device, index) in deviceBreakdown"
                :key="device.name"
                class="px-0"
              >
                <template #prepend>
                  <v-icon :color="deviceColors[index]" size="12">mdi-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">{{ device.name }}</v-list-item-title>
                <template #append>
                  <span class="text-caption font-weight-medium">{{ device.percentage }}%</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Analytics -->
    <v-row>
      <!-- Top Pages -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2">
          <v-card-title>Top Pages</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="page in topPages"
                :key="page.path"
                class="px-0"
              >
                <v-list-item-title class="text-body-2">{{ page.path }}</v-list-item-title>
                <v-list-item-subtitle>{{ page.views }} views</v-list-item-subtitle>
                <template #append>
                  <div class="text-right">
                    <div class="text-caption font-weight-medium">{{ page.bounce }}%</div>
                    <div class="text-caption text-medium-emphasis">bounce</div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Geographic Data -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2">
          <v-card-title>Geographic Distribution</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="country in geoData"
                :key="country.code"
                class="px-0"
              >
                <template #prepend>
                  <div class="country-flag">{{ country.flag }}</div>
                </template>
                <v-list-item-title class="text-body-2">{{ country.name }}</v-list-item-title>
                <template #append>
                  <div class="text-right">
                    <div class="text-caption font-weight-medium">{{ country.users }}</div>
                    <div class="text-caption text-medium-emphasis">users</div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
</script>

<style scoped>
.analytics-view {
  max-width: 100%;
}

.metric-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.country-flag {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}
</style>