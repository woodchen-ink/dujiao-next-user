<template>
  <div class="relative flex min-h-screen items-center justify-center theme-page theme-auth-page px-4 py-16 sm:px-6">
    <div class="relative z-10 w-full max-w-lg">
      <div class="mb-4 flex items-center justify-between px-1">
        <router-link
          to="/"
          class="theme-nav-link rounded-full gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ t('auth.login.backHome') }}
        </router-link>
        <span class="rounded-full border theme-pill-neutral px-3 py-1 text-xs font-semibold">
          {{ t('navbar.personalCenter') }}
        </span>
      </div>

      <div class="theme-auth-card">
        <div class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] theme-text-accent">{{ brandSiteName }}</p>
          <h1 class="mt-3 text-3xl font-black theme-text-primary">{{ t('auth.login.title') }}</h1>
          <p class="mt-2 text-sm theme-text-muted">{{ t('auth.login.subtitle') }}</p>
        </div>

        <div class="space-y-4">
          <div
            v-if="info"
            class="rounded-xl border theme-alert-success px-4 py-3 text-center text-sm"
          >
            {{ info }}
          </div>

          <div
            v-if="error"
            class="rounded-xl border theme-alert-danger px-4 py-3 text-center text-sm"
          >
            {{ error }}
          </div>

          <button
            v-if="czlConnectEnabled"
            type="button"
            :disabled="authorizing"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl theme-btn-primary px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            @click="handleCZLConnectLogin"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-5-11l6 6m0 0v-4m0 4h-4" />
            </svg>
            {{ authorizing ? t('auth.login.czlConnectPreparing') : t('auth.login.czlConnectButton') }}
          </button>

          <p v-if="czlConnectEnabled" class="text-center text-xs theme-text-muted">
            {{ t('auth.login.czlConnectHint') }}
          </p>

          <div v-else class="rounded-xl border theme-alert-danger px-4 py-3 text-center text-sm">
            {{ t('auth.login.czlConnectDisabled') }}
          </div>

          <div v-if="showTelegramWidget" class="space-y-3 pt-1">
            <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] theme-text-muted">
              <span class="h-px flex-1 border-t border-gray-200/80 dark:border-white/10"></span>
              <span>{{ t('auth.login.telegramOr') }}</span>
              <span class="h-px flex-1 border-t border-gray-200/80 dark:border-white/10"></span>
            </div>
            <div ref="telegramWidgetRef" class="flex justify-center"></div>
            <p class="text-center text-xs theme-text-muted">
              {{ t('auth.login.telegramHint') }}
            </p>
            <div v-if="showTelegramMiniAppEntry" class="space-y-2">
              <p class="text-center text-xs theme-text-muted">
                {{ t('auth.login.telegramMiniAppEntryHint') }}
              </p>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-xl border theme-btn-secondary px-4 py-3 text-sm font-semibold"
                @click="openTelegramMiniAppEntry"
              >
                {{ t('auth.login.telegramMiniAppEntryAction') }}
              </button>
            </div>
          </div>
          <div v-else-if="showMiniAppLoginHint" class="space-y-3 pt-1">
            <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] theme-text-muted">
              <span class="h-px flex-1 border-t border-gray-200/80 dark:border-white/10"></span>
              <span>{{ t('auth.login.telegramOr') }}</span>
              <span class="h-px flex-1 border-t border-gray-200/80 dark:border-white/10"></span>
            </div>
            <p class="text-center text-xs theme-text-muted">
              {{ attemptingMiniAppLogin ? t('auth.login.telegramMiniAppLoggingIn') : t('auth.login.telegramMiniAppHint') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserAuthStore } from '../../stores/userAuth'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../stores/app'
import { useTelegramMiniAppStore } from '../../stores/telegramMiniApp'
import { buildTelegramMiniAppEntryLink, isTelegramUrlEnvironment, openTelegramCompatibleLink } from '../../utils/telegramMiniApp'
import type { TelegramAuthPayload } from '../../api'
import { userAuthAPI } from '../../api'

const router = useRouter()
const route = useRoute()
const userAuthStore = useUserAuthStore()
const appStore = useAppStore()
const telegramMiniAppStore = useTelegramMiniAppStore()
const { t } = useI18n()

const brandSiteName = computed(() => {
  const siteName = String(appStore.config?.brand?.site_name || '').trim()
  return siteName !== '' ? siteName : 'CZL Store'
})

const error = ref('')
const info = ref('')
const authorizing = ref(false)
const telegramWidgetRef = ref<HTMLDivElement | null>(null)

const telegramConfig = computed(() => appStore.config?.telegram_auth || null)
const telegramBotUsername = computed(() => String(telegramConfig.value?.bot_username || '').trim())
const telegramMiniAppURL = computed(() => String(telegramConfig.value?.mini_app_url || '').trim())
const telegramEnabled = computed(() => !!telegramConfig.value?.enabled && telegramBotUsername.value !== '')
const czlConnectEnabled = computed(() => !!appStore.config?.czl_connect?.enabled)
const isTelegramMiniApp = computed(() => telegramMiniAppStore.isMiniApp && telegramMiniAppStore.isReady)
const miniAppInitData = computed(() => String(telegramMiniAppStore.initData || '').trim())
const showTelegramWidget = computed(() => telegramEnabled.value && !isTelegramMiniApp.value)
const showMiniAppLoginHint = computed(() => isTelegramMiniApp.value)
const telegramMiniAppEntryLink = computed(() => buildTelegramMiniAppEntryLink(telegramBotUsername.value, telegramMiniAppURL.value))
const isTelegramUrlEnv = isTelegramUrlEnvironment()
const showTelegramMiniAppEntry = computed(() => !isTelegramMiniApp.value && isTelegramUrlEnv && telegramMiniAppEntryLink.value !== '')
const telegramCallbackName = '__dujiaoUserTelegramLogin'
const miniAppLoginAttempted = ref(false)
const attemptingMiniAppLogin = ref(false)

const redirectAfterLogin = () => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/me/orders'
  return router.push(redirect)
}

const openTelegramMiniAppEntry = () => {
  if (telegramMiniAppEntryLink.value === '') return
  openTelegramCompatibleLink(telegramMiniAppEntryLink.value)
}

// 点击后向后端请求授权 URL，再跳转到 CZL Connect 完成授权
const handleCZLConnectLogin = async () => {
  if (authorizing.value) return
  error.value = ''
  authorizing.value = true
  try {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const response = await userAuthAPI.czlConnectAuthorize({ return_to: redirect })
    const authorizeURL = response?.data?.data?.authorize_url
    if (typeof authorizeURL !== 'string' || authorizeURL === '') {
      error.value = t('auth.login.czlConnectAuthorizeFailed')
      authorizing.value = false
      return
    }
    window.location.assign(authorizeURL)
  } catch (err: any) {
    error.value = err?.message || t('auth.login.czlConnectAuthorizeFailed')
    authorizing.value = false
  }
}

const buildTelegramPayload = (raw: any): TelegramAuthPayload | null => {
  const id = Number(raw?.id)
  const authDate = Number(raw?.auth_date)
  const hash = String(raw?.hash || '').trim()
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(authDate) || authDate <= 0 || hash === '') {
    return null
  }
  return {
    id,
    first_name: String(raw?.first_name || '').trim(),
    last_name: String(raw?.last_name || '').trim(),
    username: String(raw?.username || '').trim(),
    photo_url: String(raw?.photo_url || '').trim(),
    auth_date: authDate,
    hash,
  }
}

const handleTelegramAuth = async (raw: any) => {
  error.value = ''
  const payload = buildTelegramPayload(raw)
  if (!payload) {
    error.value = t('auth.login.telegramInvalidPayload')
    return
  }
  try {
    await userAuthStore.telegramLogin(payload)
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.telegramLoginFailed')
  }
}

const tryTelegramMiniAppLogin = async () => {
  if (!isTelegramMiniApp.value || miniAppInitData.value === '' || miniAppLoginAttempted.value || attemptingMiniAppLogin.value) {
    return
  }

  miniAppLoginAttempted.value = true
  attemptingMiniAppLogin.value = true
  error.value = ''

  try {
    await userAuthStore.telegramMiniAppLogin(miniAppInitData.value)
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.telegramLoginFailed')
  } finally {
    attemptingMiniAppLogin.value = false
  }
}

const clearTelegramWidget = () => {
  if (telegramWidgetRef.value) {
    telegramWidgetRef.value.innerHTML = ''
  }
}

const renderTelegramWidget = () => {
  if (!showTelegramWidget.value || !telegramWidgetRef.value) {
    clearTelegramWidget()
    return
  }
  clearTelegramWidget()
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-userpic', 'false')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', `${telegramCallbackName}(user)`)
  script.onerror = () => {
    error.value = t('auth.login.telegramWidgetLoadFailed')
  }
  telegramWidgetRef.value.appendChild(script)
}

const buildTelegramPayload = (raw: any): TelegramAuthPayload | null => {
  const id = Number(raw?.id)
  const authDate = Number(raw?.auth_date)
  const hash = String(raw?.hash || '').trim()
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(authDate) || authDate <= 0 || hash === '') {
    return null
  }
  return {
    id,
    first_name: String(raw?.first_name || '').trim(),
    last_name: String(raw?.last_name || '').trim(),
    username: String(raw?.username || '').trim(),
    photo_url: String(raw?.photo_url || '').trim(),
    auth_date: authDate,
    hash,
  }
}

const handleTelegramAuth = async (raw: any) => {
  error.value = ''
  const payload = buildTelegramPayload(raw)
  if (!payload) {
    error.value = t('auth.login.telegramInvalidPayload')
    return
  }
  try {
    await userAuthStore.telegramLogin(payload)
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.telegramLoginFailed')
  }
}

const tryTelegramMiniAppLogin = async () => {
  if (!isTelegramMiniApp.value || miniAppInitData.value === '' || miniAppLoginAttempted.value || attemptingMiniAppLogin.value) {
    return
  }

  miniAppLoginAttempted.value = true
  attemptingMiniAppLogin.value = true
  error.value = ''

  try {
    await userAuthStore.telegramMiniAppLogin(miniAppInitData.value)
    await redirectAfterLogin()
  } catch (err: any) {
    error.value = err.message || t('auth.login.telegramLoginFailed')
  } finally {
    attemptingMiniAppLogin.value = false
  }
}

const clearTelegramWidget = () => {
  if (telegramWidgetRef.value) {
    telegramWidgetRef.value.innerHTML = ''
  }
}

const renderTelegramWidget = () => {
  if (!showTelegramWidget.value || !telegramWidgetRef.value) {
    clearTelegramWidget()
    return
  }
  clearTelegramWidget()
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername.value)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-userpic', 'false')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', `${telegramCallbackName}(user)`)
  script.onerror = () => {
    error.value = t('auth.login.telegramWidgetLoadFailed')
  }
  telegramWidgetRef.value.appendChild(script)
}

onMounted(async () => {
  await appStore.loadConfig(true)
  const win = window as Window & Record<string, any>
  win[telegramCallbackName] = handleTelegramAuth
  renderTelegramWidget()

  const reason = typeof route.query.reason === 'string' ? route.query.reason : ''
  if (reason === 'password_changed') {
    info.value = t('auth.login.passwordChangedTip')
    const nextQuery = { ...route.query }
    delete nextQuery.reason
    router.replace({ path: route.path, query: nextQuery })
  }

  await tryTelegramMiniAppLogin()
})

watch([showTelegramWidget, telegramBotUsername], () => {
  renderTelegramWidget()
})

watch([isTelegramMiniApp, miniAppInitData], () => {
  void tryTelegramMiniAppLogin()
})

onUnmounted(() => {
  const win = window as Window & Record<string, any>
  delete win[telegramCallbackName]
  clearTelegramWidget()
})
</script>
