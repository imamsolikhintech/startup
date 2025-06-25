import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePageLoaderStore = defineStore('pageLoader', () => {
  const isLoading = ref(false)
  const loadingMessage = ref('Loading...')

  const startLoading = (message = 'Loading...') => {
    loadingMessage.value = message
    isLoading.value = true
  }

  const stopLoading = () => {
    isLoading.value = false
  }

  const setLoadingMessage = (message: string) => {
    loadingMessage.value = message
  }

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    setLoadingMessage
  }
})