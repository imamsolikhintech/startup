<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
  import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip,
  } from 'chart.js'
  import { onMounted, onUnmounted, ref, watch } from 'vue'

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler,
  )

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
      type: 'line',
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

