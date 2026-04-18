import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'

export const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'en-US'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]
export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN'

// URL slug（短码）↔ 内部 locale 双向映射
export const URL_SLUGS = ['cn', 'hk', 'en'] as const
export type UrlSlug = typeof URL_SLUGS[number]

export const SLUG_TO_LOCALE: Record<UrlSlug, SupportedLocale> = {
    'cn': 'zh-CN',
    'hk': 'zh-TW',
    'en': 'en-US',
}

export const LOCALE_TO_SLUG: Record<SupportedLocale, UrlSlug> = {
    'zh-CN': 'cn',
    'zh-TW': 'hk',
    'en-US': 'en',
}

// 判断是否是合法的 URL slug
export function isValidSlug(slug: string): slug is UrlSlug {
    return (URL_SLUGS as readonly string[]).includes(slug)
}

// 判断是否是合法的内部 locale
export function isValidLocale(locale: string): locale is SupportedLocale {
    return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

// 内部 locale 转 URL slug
export function localeToSlug(locale: string): UrlSlug {
    return LOCALE_TO_SLUG[locale as SupportedLocale] ?? 'cn'
}

// URL slug 转内部 locale
export function slugToLocale(slug: string): SupportedLocale {
    return SLUG_TO_LOCALE[slug as UrlSlug] ?? DEFAULT_LOCALE
}

// 从路径中去除 URL slug 前缀
export function stripLocalePrefix(path: string): string {
    const pattern = new RegExp(`^/(${URL_SLUGS.join('|')})(/|$)`)
    return path.replace(pattern, '/') || '/'
}

// 为路径添加 URL slug 前缀（传入内部 locale 或 slug 均可）
export function addLocalePrefix(path: string, localeOrSlug: string): string {
    const slug = isValidSlug(localeOrSlug)
        ? localeOrSlug
        : localeToSlug(localeOrSlug)
    const stripped = stripLocalePrefix(path)
    return `/${slug}${stripped === '/' ? '' : stripped}`
}

// 提供带 locale 的路由跳转方法
export function useLocalizedRouter() {
    const router = useRouter()
    const route = useRoute()
    const appStore = useAppStore()

    const push = (path: string) => {
        return router.push(addLocalePrefix(path, appStore.locale))
    }

    const replace = (path: string) => {
        return router.replace(addLocalePrefix(path, appStore.locale))
    }

    // 切换语言：保持当前路径，仅替换 slug 段
    const switchLocale = (newLocale: string) => {
        const slug = localeToSlug(newLocale)
        const currentPath = route.fullPath
        const pathWithoutLocale = stripLocalePrefix(currentPath.split('?')[0] ?? '/')
        const query = currentPath.includes('?') ? currentPath.slice(currentPath.indexOf('?')) : ''
        return router.push(`/${slug}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}${query}`)
    }

    return { push, replace, switchLocale }
}
