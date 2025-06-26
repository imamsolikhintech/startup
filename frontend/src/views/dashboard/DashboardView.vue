<template>
  <div class="dashboard-view">
    <!-- Welcome Section -->
    <div class="welcome-section mb-6">
      <n-card class="welcome-card">
        <div class="welcome-content p-6">
          <div class="welcome-grid">
            <div class="welcome-text">
              <h1 class="text-2xl font-bold mb-2">
                Welcome back, {{ authStore.user?.name }}! 👋
              </h1>
              <p class="text-gray-600">
                Here's what's happening with your dashboard today.
              </p>
            </div>
            <div class="welcome-image text-center">
              <img
                src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1"
                alt="Dashboard illustration"
                class="welcome-img"
              />
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid mb-6">
      <StatsCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :color="stat.color"
        :trend="stat.trend"
        :change="stat.change"
      />
    </div>

    <!-- Charts Section -->
    <div class="charts-section mb-6">
      <div class="revenue-chart">
        <n-card class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold">Revenue Overview</span>
              <n-button-group size="small">
                <n-button :type="chartPeriod === 'week' ? 'primary' : 'default'" @click="chartPeriod = 'week'">Week</n-button>
                <n-button :type="chartPeriod === 'month' ? 'primary' : 'default'" @click="chartPeriod = 'month'">Month</n-button>
                <n-button :type="chartPeriod === 'year' ? 'primary' : 'default'" @click="chartPeriod = 'year'">Year</n-button>
              </n-button-group>
            </div>
          </template>
          <LineChart :data="chartData" :options="chartOptions" />
        </n-card>
      </div>
      
      <div class="traffic-chart">
        <n-card class="h-full">
          <template #header>
            <span class="text-lg font-semibold">Traffic Sources</span>
          </template>
          <DoughnutChart :data="doughnutData" :options="doughnutOptions" />
        </n-card>
      </div>
    </div>

    <!-- Recent Activity & Quick Actions -->
    <div class="bottom-section">
      <div class="activity-section">
        <n-card>
          <template #header>
            <span class="text-lg font-semibold">Recent Activity</span>
          </template>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item flex items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <n-avatar
                :src="activity.avatar"
                size="medium"
                class="mr-3"
              />
              <div class="flex-1">
                <div class="text-sm font-medium">{{ activity.title }}</div>
                <div class="text-xs text-gray-500">{{ activity.description }}</div>
              </div>
              <n-tag
                :type="activity.status === 'completed' ? 'success' : 'warning'"
                size="small"
              >
                {{ activity.status }}
              </n-tag>
            </div>
          </div>
        </n-card>
      </div>

      <div class="actions-section">
        <n-card>
          <template #header>
            <span class="text-lg font-semibold">Quick Actions</span>
          </template>
          <div class="actions-list">
            <n-button
              v-for="action in quickActions"
              :key="action.title"
              :type="getActionType(action.color)"
              block
              class="action-btn mb-3"
              @click="handleQuickAction(action.action)"
            >
              <template #icon>
                <n-icon>
                  <component :is="getActionIcon(action.icon)" />
                </n-icon>
              </template>
              {{ action.title }}
            </n-button>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useChatStore } from '@/stores/chat'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import { NIcon } from 'naive-ui'
import {
  PersonAdd as PersonAddIcon,
  DocumentText as DocumentTextIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon
} from '@vicons/ionicons5'

interface StatItem {
  title: string
  value: string
  icon: string
  color: string
  trend: 'up' | 'down'
  change: string
}

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const chatStore = useChatStore()

const chartPeriod = ref('month')

const stats: StatItem[] = [
  {
    title: 'Total Users',
    value: '12,543',
    icon: 'mdi-account-multiple',
    color: 'primary',
    trend: 'up',
    change: '+12%'
  },
  {
    title: 'Revenue',
    value: '$45,231',
    icon: 'mdi-currency-usd',
    color: 'success',
    trend: 'up',
    change: '+8%'
  },
  {
    title: 'Orders',
    value: '1,429',
    icon: 'mdi-shopping',
    color: 'warning',
    trend: 'down',
    change: '-3%'
  },
  {
    title: 'Conversion',
    value: '3.24%',
    icon: 'mdi-chart-line',
    color: 'info',
    trend: 'up',
    change: '+0.5%'
  }
]

const chartData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Revenue',
      data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
      borderColor: '#1976D2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
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
      display: false
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

const doughnutData = {
  labels: ['Organic Search', 'Direct', 'Social Media', 'Email', 'Referral'],
  datasets: [
    {
      data: [45, 25, 15, 10, 5],
      backgroundColor: [
        '#1976D2',
        '#424242',
        '#FF5722',
        '#4CAF50',
        '#FF9800'
      ],
      borderWidth: 0
    }
  ]
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

const recentActivities = [
  {
    id: 1,
    title: 'New user registration',
    description: 'John Doe joined the platform',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Payment processed',
    description: 'Invoice #1234 has been paid',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    status: 'completed'
  },
  {
    id: 3,
    title: 'System backup',
    description: 'Scheduled backup in progress',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    status: 'pending'
  }
]

const quickActions = [
  {
    title: 'Add New User',
    icon: 'mdi-account-plus',
    color: 'primary',
    action: 'add-user'
  },
  {
    title: 'Generate Report',
    icon: 'mdi-file-chart',
    color: 'success',
    action: 'generate-report'
  },
  {
    title: 'Send Notification',
    icon: 'mdi-bell-plus',
    color: 'warning',
    action: 'send-notification'
  },
  {
    title: 'Start Chat',
    icon: 'mdi-chat',
    color: 'info',
    action: 'start-chat'
  }
]

const handleQuickAction = (action: string) => {
  switch (action) {
    case 'add-user':
      notificationStore.showInfo('Add User dialog would open here', 'Quick Action')
      break
    case 'generate-report':
      notificationStore.showSuccess('Your monthly report is being generated', 'Report Generated')
      break
    case 'send-notification':
      notificationStore.showSuccess('Push notification sent to all users', 'Notification Sent')
      break
    case 'start-chat':
      chatStore.startChat('2') // Start chat with Alice
      break
  }
}

const getActionIcon = (iconName: string) => {
  const iconMap = {
    'mdi-account-plus': PersonAddIcon,
    'mdi-file-chart': DocumentTextIcon,
    'mdi-bell-plus': SettingsIcon,
    'mdi-chat': AnalyticsIcon
  }
  return iconMap[iconName] || DocumentTextIcon
}

const getActionType = (color: string) => {
  const typeMap = {
    'primary': 'primary',
    'success': 'success',
    'warning': 'warning',
    'info': 'info'
  }
  return typeMap[color] || 'default'
}

onMounted(() => {
  // Simulate some periodic updates
  setInterval(() => {
    if (Math.random() > 0.7) {
      notificationStore.showInfo(`New activity detected at ${new Date().toLocaleTimeString()}`, 'System Update')
    }
  }, 30000) // Every 30 seconds
})
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
  /* max-width: 1200px; */
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-content {
  padding: 24px;
}

.welcome-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: center;
}

.welcome-text h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
}

.welcome-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.welcome-img {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.revenue-chart,
.traffic-chart {
  min-height: 400px;
}

/* Bottom Section */
.bottom-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.activity-section,
.actions-section {
  min-height: 400px;
}

/* Activity List */
.activity-list {
  padding: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item .flex-1 {
  flex: 1;
  margin-left: 12px;
}

.activity-item .text-sm {
  font-size: 0.875rem;
  font-weight: 500;
}

.activity-item .text-xs {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

/* Actions List */
.actions-list {
  padding: 16px;
}

.action-btn {
  margin-bottom: 12px;
  justify-content: flex-start;
}

.action-btn:last-child {
  margin-bottom: 0;
}

/* Utility Classes */
.mb-6 {
  margin-bottom: 24px;
}

.mb-3 {
  margin-bottom: 12px;
}

.text-center {
  text-align: center;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
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

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.h-full {
  height: 100%;
}

.p-6 {
  padding: 24px;
}

.py-3 {
  padding-top: 12px;
  padding-bottom: 12px;
}

.mr-3 {
  margin-right: 12px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-view {
    padding: 16px;
  }
  
  .welcome-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .welcome-img {
    max-width: 150px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .bottom-section {
    grid-template-columns: 1fr;
  }
  
  .welcome-text h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-view {
    padding: 12px;
  }
  
  .welcome-content {
    padding: 16px;
  }
  
  .activity-list,
  .actions-list {
    padding: 12px;
  }
}
</style>