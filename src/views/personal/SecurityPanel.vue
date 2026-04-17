<template>
  <div class="space-y-6">
    <div class="theme-personal-card">
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-bold theme-text-primary">{{ t('personalCenter.security.title') }}</h2>
          <p class="mt-1 text-sm theme-text-muted">
            {{ requiresOldEmailCode ? t('personalCenter.security.subtitle') : t('personalCenter.security.subtitleBindOnly') }}
          </p>
        </div>
        <span class="theme-badge theme-badge-accent px-3 py-1 text-xs font-semibold">
          {{ t('personalCenter.tabs.security') }}
        </span>
      </div>

      <div v-if="securityAlert" class="mb-5 rounded-xl border px-4 py-3 text-sm shadow-sm" :class="pageAlertClass(securityAlert.level)">
        {{ securityAlert.message }}
      </div>

      <EmailChangeForm
        :current-email-display="currentEmailDisplay"
        :requires-old-email-code="requiresOldEmailCode"
        v-model:new-email="securityForm.newEmail"
        v-model:old-code="securityForm.oldCode"
        v-model:new-code="securityForm.newCode"
        :sending-code="userProfileStore.sendingCode"
        :old-code-cooldown="oldCodeCooldown"
        :new-code-cooldown="newCodeCooldown"
        :changing-email="userProfileStore.changingEmail"
        @submit="handleChangeEmail"
        @send-old-code="handleSendOldCode"
        @send-new-code="handleSendNewCode"
      />
    </div>

    <LoginHistorySection
      :loading="userProfileStore.loadingLoginLogs"
      :logs="userProfileStore.recentLoginLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { pageAlertClass, type PageAlert } from '../../utils/alerts'
import { useUserProfileStore } from '../../stores/userProfile'
import EmailChangeForm from '../../components/security/EmailChangeForm.vue'
import LoginHistorySection from '../../components/security/LoginHistorySection.vue'

const { t } = useI18n()
const userProfileStore = useUserProfileStore()

const securityForm = reactive({
  newEmail: '',
  oldCode: '',
  newCode: '',
})

const securityAlert = ref<PageAlert | null>(null)
const oldCodeCooldown = ref(0)
const newCodeCooldown = ref(0)
let cooldownTimer: number | null = null
const emailChangeMode = computed(() => userProfileStore.profile?.email_change_mode || 'change_with_old_and_new')
const requiresOldEmailCode = computed(() => emailChangeMode.value !== 'bind_only')
const currentEmailDisplay = computed(() => {
  if (!requiresOldEmailCode.value) {
    return t('personalCenter.security.bindOnlyEmailDisplay')
  }
  return userProfileStore.profile?.email || ''
})

const startCooldown = (kind: 'old' | 'new') => {
  if (kind === 'old') {
    oldCodeCooldown.value = 60
  } else {
    newCodeCooldown.value = 60
  }
  if (cooldownTimer !== null) return
  cooldownTimer = window.setInterval(() => {
    if (oldCodeCooldown.value > 0) {
      oldCodeCooldown.value -= 1
    }
    if (newCodeCooldown.value > 0) {
      newCodeCooldown.value -= 1
    }
    if (oldCodeCooldown.value === 0 && newCodeCooldown.value === 0 && cooldownTimer !== null) {
      window.clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

const handleSendOldCode = async () => {
  securityAlert.value = null
  if (!requiresOldEmailCode.value) {
    securityAlert.value = {
      level: 'warning',
      message: t('personalCenter.security.bindOnlyOldCodeDisabled'),
    }
    return
  }
  const ok = await userProfileStore.sendChangeEmailCode({ kind: 'old' })
  if (!ok) {
    securityAlert.value = {
      level: 'error',
      message: userProfileStore.securityError || t('personalCenter.security.sendCodeFailed'),
    }
    return
  }
  startCooldown('old')
  securityAlert.value = {
    level: 'success',
    message: t('personalCenter.security.sendOldCodeSuccess'),
  }
}

const handleSendNewCode = async () => {
  securityAlert.value = null
  const newEmail = securityForm.newEmail.trim()
  if (!newEmail) {
    securityAlert.value = {
      level: 'warning',
      message: t('personalCenter.security.newEmailRequired'),
    }
    return
  }
  const ok = await userProfileStore.sendChangeEmailCode({ kind: 'new', new_email: newEmail })
  if (!ok) {
    securityAlert.value = {
      level: 'error',
      message: userProfileStore.securityError || t('personalCenter.security.sendCodeFailed'),
    }
    return
  }
  startCooldown('new')
  securityAlert.value = {
    level: 'success',
    message: t('personalCenter.security.sendNewCodeSuccess'),
  }
}

const handleChangeEmail = async () => {
  securityAlert.value = null
  const requiresOldCode = requiresOldEmailCode.value
  const oldCode = securityForm.oldCode.trim()
  const payload = {
    new_email: securityForm.newEmail.trim(),
    new_code: securityForm.newCode.trim(),
    ...(requiresOldCode ? { old_code: oldCode } : {}),
  }
  if (!payload.new_email || !payload.new_code || (requiresOldCode && !oldCode)) {
    securityAlert.value = {
      level: 'warning',
      message: requiresOldCode
        ? t('personalCenter.security.changeEmailRequired')
        : t('personalCenter.security.bindEmailRequired'),
    }
    return
  }

  const ok = await userProfileStore.changeEmail(payload)
  if (!ok) {
    securityAlert.value = {
      level: 'error',
      message: userProfileStore.securityError || t('personalCenter.security.changeEmailFailed'),
    }
    return
  }

  securityForm.newEmail = ''
  securityForm.oldCode = ''
  securityForm.newCode = ''
  oldCodeCooldown.value = 0
  newCodeCooldown.value = 0
  securityAlert.value = {
    level: 'success',
    message: requiresOldCode
      ? t('personalCenter.security.changeEmailSuccess')
      : t('personalCenter.security.bindEmailSuccess'),
  }
}

onMounted(async () => {
  await Promise.all([
    userProfileStore.loadRecentLoginLogs(10),
  ])
})

onUnmounted(() => {
  if (cooldownTimer !== null) {
    window.clearInterval(cooldownTimer)
    cooldownTimer = null
  }
})
</script>
