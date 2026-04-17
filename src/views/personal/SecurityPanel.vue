<template>
  <div class="space-y-6">
    <LoginHistorySection
      :loading="userProfileStore.loadingLoginLogs"
      :logs="userProfileStore.recentLoginLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserProfileStore } from '../../stores/userProfile'
import LoginHistorySection from '../../components/security/LoginHistorySection.vue'

const userProfileStore = useUserProfileStore()

onMounted(async () => {
  await userProfileStore.loadRecentLoginLogs(10)
})
</script>
