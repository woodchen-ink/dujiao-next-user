<template>
  <div class="min-h-screen theme-page pt-20 pb-16">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto mt-12 theme-panel backdrop-blur-xl border rounded-3xl p-8 md:p-12 text-center">
        <p class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold theme-surface-soft border theme-border theme-text-muted">
          <svg class="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ brandSiteName }}
        </p>
        <div class="my-4 flex justify-center">
          <svg class="w-20 h-20 md:w-24 md:h-24 theme-text-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-7xl md:text-8xl font-black tracking-tight theme-text-primary">404</p>
        <h1 class="mt-4 text-2xl md:text-4xl font-extrabold theme-text-primary">
          {{ t('notFoundPage.title') }}
        </h1>
        <p class="mt-4 text-base md:text-lg theme-text-secondary leading-relaxed">
          {{ t('notFoundPage.description', { site: brandSiteName }) }}
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <RouterLink
            :to="addLocalePrefix('/', appStore.locale)"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl theme-btn-primary border font-semibold min-w-[180px]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            {{ t('notFoundPage.backHome') }}
          </RouterLink>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl theme-btn-secondary border font-semibold min-w-[180px]"
            @click="goBack">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ t('notFoundPage.backPrevious') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../stores/app'
import { useLocalizedRouter, addLocalePrefix } from '../composables/useLocalizedRouter'

const router = useRouter()
const { push: lPush } = useLocalizedRouter()
const { t } = useI18n()
const appStore = useAppStore()

const brandSiteName = computed(() => {
  const siteName = String(appStore.config?.brand?.site_name || '').trim()
  return siteName !== '' ? siteName : 'Sunai Store'
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  void lPush('/')
}
</script>
