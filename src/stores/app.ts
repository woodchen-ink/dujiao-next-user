import { defineStore } from 'pinia'
import { ref } from 'vue'
import { configAPI } from '../api'
import { applyCustomScripts } from '../utils/customScripts'
import { useHead } from '@unhead/vue'
import { SUPPORTED_LOCALES, LOCALE_TO_SLUG, URL_SLUGS } from '../composables/useLocalizedRouter'

export const useAppStore = defineStore('app', () => {
    const locale = ref(localStorage.getItem('locale') || 'zh-CN')
    const config = ref<any>(null)
    const loading = ref(false)
    const currentPath = ref(typeof window !== 'undefined' ? window.location.pathname : '/')
    // 服务器与客户端的时间偏移量（毫秒），serverTime = clientTime + offset
    const serverTimeOffset = ref(0)

    // 设置语言
    const setLocale = (newLocale: string) => {
        locale.value = newLocale
        localStorage.setItem('locale', newLocale)
    }

    // locale 代码到 hreflang 值的映射
    const localeToHreflang: Record<string, string> = {
        'zh-CN': 'zh-Hans',
        'zh-TW': 'zh-Hant',
        'en-US': 'en',
    }

    // 全局响应式 SEO 配置
    useHead({
        title: () => {
            const seo = config.value?.seo
            if (!seo) return undefined
            const lang = locale.value
            return seo.title && seo.title[lang] ? seo.title[lang] : undefined
        },
        meta: () => {
            const seo = config.value?.seo
            if (!seo) return []
            const lang = locale.value
            const tags = []

            // 基础 SEO 标签
            if (seo.keywords && seo.keywords[lang]) {
                tags.push({ name: 'keywords', content: seo.keywords[lang] })
            }
            if (seo.description && seo.description[lang]) {
                tags.push({ name: 'description', content: seo.description[lang] })
            }

            // Open Graph 标签
            tags.push({ property: 'og:type', content: 'website' })
            if (seo.title && seo.title[lang]) {
                tags.push({ property: 'og:title', content: seo.title[lang] })
            }
            if (seo.description && seo.description[lang]) {
                tags.push({ property: 'og:description', content: seo.description[lang] })
            }
            tags.push({ property: 'og:url', content: window.location.href })
            // 注意：全局设置通常可以设置一个通用的 default_og_image

            // Twitter Card 标签
            tags.push({ name: 'twitter:card', content: 'summary_large_image' })
            if (seo.title && seo.title[lang]) {
                tags.push({ name: 'twitter:title', content: seo.title[lang] })
            }
            if (seo.description && seo.description[lang]) {
                tags.push({ name: 'twitter:description', content: seo.description[lang] })
            }

            return tags
        },
        link: () => {
            if (typeof window === 'undefined') return []
            // 当前路径去掉 locale 前缀，重新拼接各语言版本的 hreflang
            const path = currentPath.value
            const origin = window.location.origin
            const pathWithoutLocale = path.replace(
                new RegExp(`^/(${URL_SLUGS.join('|')})(/|$)`),
                '/'
            ) || '/'
            const links = SUPPORTED_LOCALES.map((loc) => ({
                rel: 'alternate',
                hreflang: localeToHreflang[loc] || loc,
                href: `${origin}/${LOCALE_TO_SLUG[loc]}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`,
            }))
            // x-default 指向简体中文
            links.push({
                rel: 'alternate',
                hreflang: 'x-default',
                href: `${origin}/cn${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`,
            })
            return links
        },
    })

    // 更新SEO信息，在路由变化后同步当前路径（供 hreflang 使用）
    const applySEO = () => {
        if (typeof window !== 'undefined') {
            currentPath.value = window.location.pathname
        }
    }

    // 加载全局配置
    const loadConfig = async (force = false) => {
        if (config.value && !force) {
            applySEO()
            applyCustomScripts(config.value?.scripts)
            return
        }
        if (!force) loading.value = true
        try {
            const requestTime = Date.now()
            const response = await configAPI.get()
            config.value = response.data.data
            // 计算服务器与客户端的时间偏移量
            if (config.value?.server_time) {
                const responseTime = Date.now()
                const roundTripTime = responseTime - requestTime
                const estimatedServerNow = config.value.server_time + roundTripTime / 2
                serverTimeOffset.value = estimatedServerNow - responseTime
            }
            applySEO()
            applyCustomScripts(config.value?.scripts)
            // Print version to console
            if (config.value?.app_version) {
                console.log(
                    '%c Version %c ' + config.value.app_version + ' %c',
                    'background:#34c759;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:bold;',
                    'background:#1d1d1f;color:#f5f5f7;padding:2px 6px;border-radius:0 4px 4px 0;',
                    'background:transparent;',
                )
            }
        } catch (error) {
            console.error('Failed to load config:', error)
        } finally {
            if (!force) loading.value = false
        }
    }

    // 获取校正后的服务器当前时间（毫秒时间戳）
    const getServerTime = () => Date.now() + serverTimeOffset.value

    // 获取校正后的服务器当前 Date 对象
    const getServerDate = () => new Date(getServerTime())

    return {
        locale,
        config,
        loading,
        serverTimeOffset,
        setLocale,
        loadConfig,
        applySEO,
        getServerTime,
        getServerDate,
    }
})
