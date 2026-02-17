import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { configAPI } from '../api'
import { applyCustomScripts } from '../utils/customScripts'

export const useAppStore = defineStore('app', () => {
    const locale = ref(localStorage.getItem('locale') || 'zh-CN')
    const config = ref<any>(null)
    const loading = ref(false)

    // 设置语言
    const setLocale = (newLocale: string) => {
        locale.value = newLocale
        localStorage.setItem('locale', newLocale)
    }

    // 更新SEO信息
    const applySEO = () => {
        if (!config.value?.seo) {
            return
        }

        // 确保 lang 匹配配置中的键（zh-CN, zh-TW, en-US）
        // 如果 locale 格式不匹配需要转换，但这里假设是一致的
        const lang = locale.value
        const seo = config.value.seo

        // Title
        if (seo.title && seo.title[lang]) {
            document.title = seo.title[lang]
        }

        // Description
        if (seo.description && seo.description[lang]) {
            let metaDesc = document.querySelector('meta[name="description"]')
            if (!metaDesc) {
                metaDesc = document.createElement('meta')
                metaDesc.setAttribute('name', 'description')
                document.head.appendChild(metaDesc)
            }
            metaDesc.setAttribute('content', seo.description[lang])
        }

        // Keywords
        if (seo.keywords && seo.keywords[lang]) {
            let metaKeywords = document.querySelector('meta[name="keywords"]')
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta')
                metaKeywords.setAttribute('name', 'keywords')
                document.head.appendChild(metaKeywords)
            }
            metaKeywords.setAttribute('content', seo.keywords[lang])
        }
    }

    // 监听语言变化更新SEO
    // 监听语言变化更新SEO
    watch(locale, () => {
        applySEO()
    })

    // 加载全局配置
    const loadConfig = async (force = false) => {
        if (config.value && !force) {
            applySEO()
            applyCustomScripts(config.value?.scripts)
            return
        }
        loading.value = true
        try {
            const response = await configAPI.get()
            config.value = response.data.data
            applySEO()
            applyCustomScripts(config.value?.scripts)
        } catch (error) {
            console.error('Failed to load config:', error)
        } finally {
            loading.value = false
        }
    }

    return {
        locale,
        config,
        loading,
        setLocale,
        loadConfig,
        applySEO
    }
})
