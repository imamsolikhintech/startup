<template>
  <CustomDialog
    :show="show"
    :max-width="1200"
    title="User Activity & Login History"
    subtitle="View detailed user activity statistics and login history"
    header-icon="mdi-chart-line"
    header-icon-color="info"
    :loading="loading"
    :show-confirm-button="false"
    cancel-button-text="Close"
    @update:show="$emit('update:show', $event)"
    @cancel="$emit('close')"
    @close="$emit('close')"
  >
        <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
        
        <div v-else-if="activityData">
          <v-tabs v-model="activeTab" class="mb-4">
            <v-tab value="statistics">Activity Statistics</v-tab>
            <v-tab value="daily">Daily Activity</v-tab>
            <v-tab value="sessions">Recent Sessions</v-tab>
          </v-tabs>

          <v-tabs-window v-model="activeTab">
            <!-- Activity Statistics Tab -->
            <v-tabs-window-item value="statistics">
              <v-row class="mb-4">
                <v-col cols="12">
              <v-row>
                <v-col cols="6" md="3">
                  <v-card class="pa-3 text-center">
                    <div class="text-h4 text-primary">{{ activityData.statistics.total_logins }}</div>
                    <div class="text-caption">Total Logins</div>
                  </v-card>
                </v-col>
                <v-col cols="6" md="3">
                  <v-card class="pa-3 text-center">
                    <div class="text-h4 text-success">{{ activityData.statistics.unique_ips }}</div>
                    <div class="text-caption">Unique IPs</div>
                  </v-card>
                </v-col>
                <v-col cols="6" md="3">
                  <v-card class="pa-3 text-center">
                    <div class="text-h4 text-info">{{ activityData.statistics.total_days }}</div>
                    <div class="text-caption">Active Days</div>
                  </v-card>
                </v-col>
                <v-col cols="6" md="3">
                  <v-card class="pa-3 text-center">
                    <div class="text-h4 text-warning">{{ activityData.statistics.average_per_day?.toFixed(1) || '0.0' }}</div>
                    <div class="text-caption">Avg/Day</div>
                  </v-card>
                </v-col>
              </v-row>
              <v-row class="mt-2">
                <v-col cols="6" md="3">
                  <v-card class="pa-3 text-center">
                    <div class="text-h4 text-purple">{{ activityData.statistics.most_active_day || 'N/A' }}</div>
                    <div class="text-caption">Most Active Day</div>
                  </v-card>
                </v-col>
                <v-col cols="6" md="3">
                  <v-card class="pa-3 text-center">
                    <div class="text-h4 text-indigo">{{ formatDate(activityData.statistics.last_login) }}</div>
                    <div class="text-caption">Last Login</div>
                  </v-card>
                </v-col>
              </v-row>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <!-- Daily Activity Tab -->
            <v-tabs-window-item value="daily">
              <v-row class="mb-4">
                <v-col cols="12">
              <v-card class="pa-4">
                <div v-if="activityData.activity_log && activityData.activity_log.length > 0">
                  <v-row class="mb-2 font-weight-bold">
                    <v-col cols="4">Date</v-col>
                    <v-col cols="4">Logins</v-col>
                    <v-col cols="4">Unique IPs</v-col>
                  </v-row>
                  <v-divider class="mb-2"></v-divider>
                  <v-row v-for="activity in activityData.activity_log.slice(0, 10)" :key="String(activity.date)" class="mb-2">
                    <v-col cols="4">{{ formatDate(activity.date) }}</v-col>
                    <v-col cols="4">{{ activity.login_count }} logins</v-col>
                    <v-col cols="4">{{ activity.unique_ips }} unique IPs</v-col>
                  </v-row>
                </div>
                <div v-else class="text-center text-grey">
                  No activity data available
                </div>
              </v-card>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <!-- Recent Sessions Tab -->
            <v-tabs-window-item value="sessions">
              <v-row>
                <v-col cols="12">
              <v-data-table
                :headers="loginHistoryHeaders"
                :items="loginHistory"
                :items-per-page="10"
                class="elevation-1"
              >
                <template #item.login_time="{ item }">
                  {{ formatDateTime(item.login_time) }}
                </template>
                
                <template #item.location="{ item }">
                  <span v-if="item.city || item.country">
                    {{ item.city }}{{ item.city && item.country ? ', ' : '' }}{{ item.country }}
                  </span>
                  <span v-else class="text-grey">Unknown</span>
                </template>
                
                <template #item.device_info="{ item }">
                  <div>
                    <div class="text-body-2">{{ item.browser || 'Unknown Browser' }}</div>
                    <div class="text-caption text-grey">{{ item.os || 'Unknown OS' }}</div>
                  </div>
                </template>
                
                <template #item.success="{ item }">
                  <v-chip
                    :color="item.success ? 'success' : 'error'"
                    size="small"
                    variant="flat"
                  >
                    {{ item.success ? 'Success' : 'Failed' }}
                  </v-chip>
                  <div v-if="!item.success && item.failure_reason" class="text-caption text-error mt-1">
                    {{ item.failure_reason }}
                  </div>
                </template>
              </v-data-table>
                </v-col>
              </v-row>
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
        
        <div v-else class="text-center py-8">
          <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-chart-line</v-icon>
          <div class="text-h6 text-medium-emphasis">No activity data available</div>
        </div>
  </CustomDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomDialog from '@/components/dialog/CustomDialog.vue'

const activeTab = ref('statistics')
interface ActivityStatistics {
  total_logins: number
  unique_ips: number
  total_days: number
  average_per_day?: number
  most_active_day?: string
  last_login: string | Date
}

interface ActivityLog {
  date: string | Date
  login_count: number
  unique_ips: number
}

interface UserActivityData {
  statistics: ActivityStatistics
  activity_log: ActivityLog[]
}

interface LoginHistory {
  login_time: string | Date
  ip: string
  city?: string
  country?: string
  browser?: string
  os?: string
  device_info?: string
  success: boolean
  failure_reason?: string
}

interface Props {
  show: boolean
  loading: boolean
  activityData: UserActivityData | null
  loginHistory: LoginHistory[]
}

defineProps<Props>()
defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const loginHistoryHeaders = [
  { title: 'Date/Time', key: 'login_time' },
  { title: 'IP Address', key: 'ip' },
  { title: 'Location', key: 'location' },
  { title: 'Device', key: 'device_info' },
  { title: 'Status', key: 'success' }
]

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

const formatDateTime = (dateTime: string | Date) => {
  return new Date(dateTime).toLocaleString()
}
</script>