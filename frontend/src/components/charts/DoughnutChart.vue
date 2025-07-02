<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
  import {
    ArcElement,
    Chart as ChartJS,
    DoughnutController,
    Legend,
    Tooltip,
  } from 'chart.js'
  import { onMounted, onUnmounted, ref, watch } from 'vue'

  ChartJS.register(ArcElement, DoughnutController, Tooltip, Legend)

  interface Props {
    data: any,
    options?: any,
  }

  const props = defineProps<Props>()

  const chartRef = ref<HTMLCanvasElement>()
  let chart: ChartJS | null = null

  const createChart = () => {
    if (!chartRef.value) return

    if (chart) {
      chart.destroy()
    }

    chart = new ChartJS(chartRef.value, {
      type: 'doughnut',
      data: props.data,
      options: {
        ...props.options,
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  onMounted(() => {
    createChart()
  })

  onUnmounted(() => {
    if (chart) {
      chart.destroy()
    }
  })

  watch(() => props.data, () => {
    createChart()
  }, { deep: true })
</script>

