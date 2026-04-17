<template>
  <div class="relative flex min-h-screen items-center justify-center theme-page theme-auth-page px-4 py-16 sm:px-6">
    <div class="relative z-10 w-full max-w-md">
      <div class="theme-auth-card text-center">
        <h1 class="mt-2 text-2xl font-black theme-text-primary">
          {{ t('auth.login.czlConnectCallbackTitle') }}
        </h1>

        <p v-if="status === 'processing'" class="mt-6 text-sm theme-text-muted">
          {{ t('auth.login.czlConnectCallbackProcessing') }}
        </p>

        <div v-else-if="status === 'success'" class="mt-6 rounded-xl border theme-alert-success px-4 py-3 text-sm">
          {{ t('auth.login.czlConnectCallbackSuccess') }}
        </div>

        <div v-else class="mt-6 space-y-4">
          <div class="rounded-xl border theme-alert-danger px-4 py-3 text-sm">
            <p class="font-semibold">{{ t('auth.login.czlConnectCallbackFailed') }}</p>
            <p v-if="errorMessage" class="mt-1 text-xs opacity-80">{{ errorMessage }}</p>
          </div>
          <router-link
            to="/auth/login"
            class="inline-flex w-full items-center justify-center rounded-xl theme-btn-primary px-4 py-3 text-sm font-bold"
          >
            {{ t('auth.login.czlConnectCallbackRetry') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserAuthStore } from '../../stores/userAuth'

const route = useRoute()
const router = useRouter()
const userAuthStore = useUserAuthStore()
const { t } = useI18n()

type CallbackStatus = 'processing' | 'success' | 'failed'
const status = ref<CallbackStatus>('processing')
const errorMessage = ref('')

// CZL Connect 授权完成后回跳到本页面，提取 code/state 并向后端换 token/登录
const resolveRedirect = (returnTo: string): string => {
  const queryRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  const target = returnTo || queryRedirect || '/me/orders'
  // 仅允许站内相对跳转，防止 open redirect
  if (/^https?:\/\//i.test(target) || target.startsWith('//')) {
    return '/me/orders'
  }
  return target.startsWith('/') ? target : '/me/orders'
}

onMounted(async () => {
  const errorParam = typeof route.query.error === 'string' ? route.query.error.trim() : ''
  if (errorParam !== '') {
    status.value = 'failed'
    errorMessage.value = errorParam
    return
  }

  const code = typeof route.query.code === 'string' ? route.query.code.trim() : ''
  const state = typeof route.query.state === 'string' ? route.query.state.trim() : ''
  if (code === '' || state === '') {
    status.value = 'failed'
    errorMessage.value = t('auth.login.czlConnectCallbackMissingParams')
    return
  }

  try {
    const result = await userAuthStore.czlConnectLogin({ code, state })
    status.value = 'success'
    const redirect = resolveRedirect(result.returnTo)
    await router.replace(redirect)
  } catch (err: any) {
    status.value = 'failed'
    errorMessage.value = err?.message || t('auth.login.czlConnectCallbackFailed')
  }
})
</script>
