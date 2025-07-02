<template>
  <div class="dashboard-view">
    <!-- Welcome Section -->
    <n-space
      vertical
      size="large">
      <n-card
        class="welcome-card"
        size="large">
        <div class="welcome-content">
          <n-grid
            cols="1 s:2"
            responsive="screen"
            :x-gap="24"
            :y-gap="16">
            <n-grid-item>
              <div class="welcome-text">
                <h1 class="welcome-title">
                  Welcome back, {{ authStore.user?.name }}! 👋
                </h1>
                <p class="welcome-subtitle">
                  Here's what's happening with your dashboard today.
                </p>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="welcome-image">
                <img
                  src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1"
                  alt="Dashboard illustration"
                  class="welcome-img">
              </div>
            </n-grid-item>
          </n-grid>
        </div>
      </n-card>

      <!-- Stats Cards -->
      <n-grid
        cols="1 s:2 m:4"
        responsive="screen"
        :x-gap="16"
        :y-gap="16">
        <n-grid-item
          v-for="stat in stats"
          :key="stat.title">
          <stats-card
            :title="stat.title"
            :value="stat.value"
            :icon="stat.icon"
            :color="stat.color"
            :trend="stat.trend"
            :change="stat.change" />
        </n-grid-item>
      </n-grid>

      <!-- Charts Section -->
      <n-grid
        cols="1 m:3"
        responsive="screen"
        :x-gap="16"
        :y-gap="16">
        <n-grid-item span="1 m:2">
          <n-card class="chart-card">
            <template #header>
              <n-space
                justify="space-between"
                align="center">
                <span class="chart-title">Revenue Overview</span>
                <n-button-group size="small">
                  <n-button
                    :type="chartPeriod === 'week' ? 'primary' : 'default'"
                    @click="chartPeriod = 'week'">
                    Week
                  </n-button>
                  <n-button
                    :type="chartPeriod === 'month' ? 'primary' : 'default'"
                    @click="chartPeriod = 'month'">
                    Month
                  </n-button>
                  <n-button
                    :type="chartPeriod === 'year' ? 'primary' : 'default'"
                    @click="chartPeriod = 'year'">
                    Year
                  </n-button>
                </n-button-group>
              </n-space>
            </template>
            <div class="chart-container">
              <line-chart
                :data="chartData"
                :options="chartOptions" />
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card class="chart-card">
            <template #header>
              <span class="chart-title">Traffic Sources</span>
            </template>
            <div class="chart-container">
              <doughnut-chart
                :data="doughnutData"
                :options="doughnutOptions" />
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- Recent Activity & Quick Actions -->
      <n-grid
        cols="1 m:3"
        responsive="screen"
        :x-gap="16"
        :y-gap="16">
        <n-grid-item span="1 m:2">
          <n-card>
            <template #header>
              <span class="section-title">Recent Activity</span>
            </template>
            <n-list>
              <n-list-item
                v-for="activity in recentActivities"
                :key="activity.id">
                <n-space align="center">
                  <n-avatar
                    :src="activity.avatar"
                    size="medium" />
                  <div class="activity-content">
                    <div class="activity-title">
                      {{ activity.title }}
                    </div>
                    <div class="activity-description">
                      {{ activity.description }}
                    </div>
                  </div>
                  <n-tag
                    :type="activity.status === 'completed' ? 'success' : 'warning'"
                    size="small">
                    {{ activity.status }}
                  </n-tag>
                </n-space>
              </n-list-item>
            </n-list>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <template #header>
              <span class="section-title">Quick Actions</span>
            </template>
            <n-space vertical>
              <n-button
                v-for="action in quickActions"
                :key="action.title"
                :type="getActionType(action.color)"
                block
                @click="handleQuickAction(action.action)">
                <template #icon>
                  <n-icon>
                    <component :is="getActionIcon(action.icon)" />
                  </n-icon>
                </template>
                {{ action.title }}
              </n-button>
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-space>
  </div>
</template>

<script setup lang="ts">
  import {
    Analytics as AnalyticsIcon,
    DocumentText as DocumentTextIcon,
    PersonAdd as PersonAddIcon,
    Settings as SettingsIcon,
  } from '@vicons/ionicons5'
  import { NAvatar, NButton, NButtonGroup, NCard, NGrid, NGridItem, NIcon, NList, NListItem, NSpace, NTag } from 'naive-ui'
  import { computed, onMounted, ref } from 'vue'
  import DoughnutChart from '@/components/charts/DoughnutChart.vue'
  import LineChart from '@/components/charts/LineChart.vue'
  import StatsCard from '@/components/dashboard/StatsCard.vue'
  import { useAuthStore } from '@/stores/auth'
  import { useChatStore } from '@/stores/chat'
  import { useNotificationStore } from '@/stores/notifications'

  interface StatItem {
    title: string,
    value: string,
    icon: string,
    color: string,
    trend: 'up' | 'down',
    change: string,
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
      change: '+12%',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      icon: 'mdi-currency-usd',
      color: 'success',
      trend: 'up',
      change: '+8%',
    },
    {
      title: 'Orders',
      value: '1,429',
      icon: 'mdi-shopping',
      color: 'warning',
      trend: 'down',
      change: '-3%',
    },
    {
      title: 'Conversion',
      value: '3.24%',
      icon: 'mdi-chart-line',
      color: 'info',
      trend: 'up',
      change: '+0.5%',
    },
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
        tension: 0.4,
      },
    ],
  }))

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
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
          '#FF9800',
        ],
        borderWidth: 0,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const recentActivities = [
    {
      id: 1,
      title: 'New user registration',
      description: 'John Doe joined the platform',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Payment processed',
      description: 'Invoice #1234 has been paid',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      status: 'completed',
    },
    {
      id: 3,
      title: 'System backup',
      description: 'Scheduled backup in progress',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      status: 'pending',
    },
  ]

  const quickActions = [
    {
      title: 'Add New User',
      icon: 'mdi-account-plus',
      color: 'primary',
      action: 'add-user',
    },
    {
      title: 'Generate Report',
      icon: 'mdi-file-chart',
      color: 'success',
      action: 'generate-report',
    },
    {
      title: 'Send Notification',
      icon: 'mdi-bell-plus',
      color: 'warning',
      action: 'send-notification',
    },
    {
      title: 'Start Chat',
      icon: 'mdi-chat',
      color: 'info',
      action: 'start-chat',
    },
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
      'mdi-chat': AnalyticsIcon,
    }
    return iconMap[iconName] || DocumentTextIcon
  }

  const getActionType = (color: string) => {
    const typeMap = {
      'primary': 'primary',
      'success': 'success',
      'warning': 'warning',
      'info': 'info',
    }
    return typeMap[color] || 'default'
  }

  onMounted(() => {
  // Simulate some periodic updates
  // setInterval(() => {
  //   if (Math.random() > 0.7) {
  //     notificationStore.showInfo(`New activity detected at ${new Date().toLocaleTimeString()}`, 'System Update')
  //   }
  // }, 30000) // Every 30 seconds
  })
</script>

<style scoped>
.dashboard-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-card {
  /* background: linear-gradient(135deg, rgb(255, 255, 255) 100%, rgb(255, 255, 255) 100%); */
  /* color: white; */
}

.welcome-content {
  padding: 2rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  /* color: black; */
}

.welcome-subtitle {
  /* color: gray; */
  font-size: 1.125rem;
  margin: 0;
}

.welcome-image {
  text-align: center;
}

.welcome-img {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
}

/* Charts Section */
.chart-card {
  height: 400px;
}

.chart-container {
  height: 320px;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--n-text-color-base);
}

/* Activity Section */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--n-text-color-base);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--n-text-color-base);
  margin-bottom: 0.25rem;
}

.activity-description {
  font-size: 0.75rem;
  color: var(--n-text-color-placeholder);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-view {
    padding: 1rem;
  }

  .welcome-content {
    padding: 1.5rem;
  }

  .welcome-img {
    max-width: 150px;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .chart-card {
    height: 300px;
  }

  .chart-container {
    height: 220px;
  }
}

@media (max-width: 480px) {
  .dashboard-view {
    padding: 0.75rem;
  }

  .welcome-content {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .welcome-subtitle {
    font-size: 0.875rem;
  }
}
</style>
