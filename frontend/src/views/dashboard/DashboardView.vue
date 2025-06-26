<template>
  <div class="dashboard-view">
    <!-- Welcome Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="welcome-card" variant="tonal" color="primary">
          <v-card-text class="pa-6">
            <v-row align="center">
              <v-col cols="12" md="8">
                <h1 class="text-h4 font-weight-bold mb-2">
                  Welcome back, {{ authStore.user?.name }}! 👋
                </h1>
                <p class="text-subtitle-1 opacity-90">
                  Here's what's happening with your dashboard today.
                </p>
              </v-col>
              <v-col cols="12" md="4" class="text-center">
                <v-img
                  src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1"
                  max-width="200"
                  class="mx-auto"
                  rounded="lg"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
        <StatsCard
          :title="stat.title"
          :value="stat.value"
          :icon="stat.icon"
          :color="stat.color"
          :trend="stat.trend"
          :change="stat.change"
        />
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="2">
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6">Revenue Overview</span>
            <v-btn-toggle v-model="chartPeriod" mandatory>
              <v-btn size="small" value="week">Week</v-btn>
              <v-btn size="small" value="month">Month</v-btn>
              <v-btn size="small" value="year">Year</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <LineChart :data="chartData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2" class="h-100">
          <v-card-title>
            <span class="text-h6">Traffic Sources</span>
          </v-card-title>
          <v-card-text>
            <DoughnutChart :data="doughnutData" :options="doughnutOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity & Quick Actions -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="2">
          <v-card-title>
            <span class="text-h6">Recent Activity</span>
          </v-card-title>
          <v-list lines="two">
            <v-list-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :prepend-avatar="activity.avatar"
            >
              <v-list-item-title>{{ activity.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ activity.description }}</v-list-item-subtitle>
              <template #append>
                <v-chip
                  :color="activity.status === 'completed' ? 'success' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  {{ activity.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2">
          <v-card-title>
            <span class="text-h6">Quick Actions</span>
          </v-card-title>
          <v-card-text>
            <v-btn
              v-for="action in quickActions"
              :key="action.title"
              :prepend-icon="action.icon"
              :color="action.color"
              variant="tonal"
              block
              class="mb-3 justify-start"
              @click="handleQuickAction(action.action)"
            >
              {{ action.title }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useChatStore } from '@/stores/chat'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'

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

onMounted(() => {
  // Simulate some periodic updates
  setInterval(() => {
    if (Math.random() > 0.7) {
      notificationStore.showInfo(`New activity detected at ${new Date().toLocaleTimeString()}`, 'System Update')
    }
  }, 30000) // Every 30 seconds
})
</script>