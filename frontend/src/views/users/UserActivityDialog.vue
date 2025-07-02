<template>
  <custom-dialog
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
    @close="$emit('close')">
    <n-progress
      v-if="loading"
      type="line"
      :show-indicator="false" />

    <div v-else-if="activityData">
      <n-tabs
        v-model:value="activeTab"
        type="line"
        class="mb-4">
        <n-tab-pane
          name="statistics"
          tab="Activity Statistics" />
        <n-tab-pane
          name="daily"
          tab="Daily Activity" />
        <n-tab-pane
          name="sessions"
          tab="Recent Sessions" />
      </n-tabs>

      <div class="tab-content">
        <!-- Activity Statistics Tab -->
        <div v-if="activeTab === 'statistics'">
          <div class="stats-grid mb-4">
            <n-card class="stat-card">
              <div class="stat-value primary">
                {{ activityData.statistics.total_logins }}
              </div>
              <div class="stat-label">
                Total Logins
              </div>
            </n-card>
            <n-card class="stat-card">
              <div class="stat-value success">
                {{ activityData.statistics.unique_ips }}
              </div>
              <div class="stat-label">
                Unique IPs
              </div>
            </n-card>
            <n-card class="stat-card">
              <div class="stat-value info">
                {{ activityData.statistics.total_days }}
              </div>
              <div class="stat-label">
                Active Days
              </div>
            </n-card>
            <n-card class="stat-card">
              <div class="stat-value warning">
                {{ activityData.statistics.average_per_day?.toFixed(1) || '0.0' }}
              </div>
              <div class="stat-label">
                Avg/Day
              </div>
            </n-card>
            <n-card class="stat-card">
              <div class="stat-value purple">
                {{ activityData.statistics.most_active_day || 'N/A' }}
              </div>
              <div class="stat-label">
                Most Active Day
              </div>
            </n-card>
            <n-card class="stat-card">
              <div class="stat-value indigo">
                {{ formatDate(activityData.statistics.last_login) }}
              </div>
              <div class="stat-label">
                Last Login
              </div>
            </n-card>
          </div>
        </div>

        <!-- Daily Activity Tab -->
        <div v-if="activeTab === 'daily'">
          <n-card class="activity-table">
            <div v-if="activityData.activity_log && activityData.activity_log.length > 0">
              <div class="table-header">
                <div class="header-cell">
                  Date
                </div>
                <div class="header-cell">
                  Logins
                </div>
                <div class="header-cell">
                  Unique IPs
                </div>
              </div>
              <n-divider class="mb-2" />
              <div
                v-for="activity in activityData.activity_log.slice(0, 10)"
                :key="String(activity.date)"
                class="table-row">
                <div class="table-cell">
                  {{ formatDate(activity.date) }}
                </div>
                <div class="table-cell">
                  {{ activity.login_count }} logins
                </div>
                <div class="table-cell">
                  {{ activity.unique_ips }} unique IPs
                </div>
              </div>
            </div>
            <div
              v-else
              class="no-data">
              No activity data available
            </div>
          </n-card>
        </div>

        <!-- Recent Sessions Tab -->
        <div v-if="activeTab === 'sessions'">
          <n-data-table
            :columns="loginHistoryColumns"
            :data="loginHistory"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            :row-key="(row) => row.id || row.login_time" />
        </div>
      </div>
    </div>

    <div
      v-else
      class="no-data-container">
      <n-icon
        size="64"
        color="#ccc"
        class="mb-4">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
        </svg>
      </n-icon>
      <div class="no-data-text">
        No activity data available
      </div>
    </div>
  </custom-dialog>
</template>

<script setup lang="ts">
  import { NCard, NDataTable, NDivider, NIcon, NProgress, NTabPane, NTabs, NTag } from 'naive-ui'
  import { h, ref } from 'vue'
  import CustomDialog from '@/components/dialog/CustomDialog.vue'

  const activeTab = ref('statistics')
  interface ActivityStatistics {
    total_logins: number,
    unique_ips: number,
    total_days: number,
    average_per_day?: number,
    most_active_day?: string,
    last_login: string | Date,
  }

  interface ActivityLog {
    date: string | Date,
    login_count: number,
    unique_ips: number,
  }

  interface UserActivityData {
    statistics: ActivityStatistics,
    activity_log: ActivityLog[],
  }

  interface LoginHistory {
    login_time: string | Date,
    ip: string,
    city?: string,
    country?: string,
    browser?: string,
    os?: string,
    device_info?: string,
    success: boolean,
    failure_reason?: string,
  }

  interface Props {
    show: boolean,
    loading: boolean,
    activityData: UserActivityData | null,
    loginHistory: LoginHistory[],
  }

  defineProps<Props>()
  defineEmits<{
    'update:show': [value: boolean],
    close: [],
  }>()

  const loginHistoryColumns = [
    {
      title: 'Date/Time',
      key: 'login_time',
      render: (row: LoginHistory) => formatDateTime(row.login_time),
    },
    {
      title: 'IP Address',
      key: 'ip',
    },
    {
      title: 'Location',
      key: 'location',
      render: (row: LoginHistory) => {
        if (row.city || row.country) {
          return `${row.city}${row.city && row.country ? ', ' : ''}${row.country}`
        }
        return 'Unknown'
      },
    },
    {
      title: 'Device',
      key: 'device_info',
      render: (row: LoginHistory) => h('div', [
        h('div', { class: 'device-browser' }, row.browser || 'Unknown Browser'),
        h('div', { class: 'device-os' }, row.os || 'Unknown OS'),
      ]),
    },
    {
      title: 'Status',
      key: 'success',
      render: (row: LoginHistory) => h('div', [
        h(NTag, {
          type: row.success ? 'success' : 'error',
          size: 'small',
        }, { default: () => row.success ? 'Success' : 'Failed' }),
        row.failure_reason && !row.success ? h('div', { class: 'failure-reason' }, row.failure_reason) : null,
      ]),
    },
  ]

  const formatDate = (date: string | Date) => {
    if (!date) return 'Never'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString()
  }
</script>

<style scoped>
.tab-content {
  margin-top: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-value.primary {
  color: var(--primary-color);
}

.stat-value.success {
  color: var(--success-color);
}

.stat-value.info {
  color: var(--info-color);
}

.stat-value.warning {
  color: var(--warning-color);
}

.stat-value.purple {
  color: #9c27b0;
}

.stat-value.indigo {
  color: #3f51b5;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-3);
}

.activity-table {
  padding: 1.5rem;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.header-cell {
  font-weight: bold;
  color: var(--text-color-1);
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
}

.table-cell {
  color: var(--text-color-2);
}

.no-data {
  text-align: center;
  color: var(--text-color-3);
  padding: 2rem;
}

.no-data-container {
  text-align: center;
  padding: 3rem;
}

.no-data-text {
  font-size: 1.125rem;
  color: var(--text-color-2);
  margin-top: 1rem;
}

.device-browser {
  font-size: 0.875rem;
  color: var(--text-color-1);
}

.device-os {
  font-size: 0.75rem;
  color: var(--text-color-3);
}

.failure-reason {
  font-size: 0.75rem;
  color: var(--error-color);
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .header-cell {
    display: none;
  }

  .table-cell {
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .table-cell:before {
    content: attr(data-label) ': ';
    font-weight: bold;
    color: var(--text-color-1);
  }
}
</style>
