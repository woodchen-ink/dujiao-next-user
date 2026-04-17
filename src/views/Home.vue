<template>
  <div class="home-page min-h-screen theme-page">

    <!-- ==================== LIST MODE ==================== -->
    <template v-if="templateMode === 'list'">
      <!-- Main: Left Categories + Right Product List -->
      <section class="relative z-10 pb-6 pt-24">
        <div class="container mx-auto px-4">
          <div class="flex flex-col lg:flex-row gap-6">

            <CategorySidebar
              :categories="listCategoryGroups"
              :selected-category="listSelectedCategory"
              :expanded-parent-ids="listExpandedParentIds"
              :show-drawer="listShowFilterDrawer"
              compact
              @select-category="listSelectCategory"
              @toggle-parent="listToggleParentCategory"
              @update:show-drawer="listShowFilterDrawer = $event"
            />

            <!-- Right: Product List -->
            <main class="flex-1 min-w-0">
              <!-- Search Bar -->
              <div class="relative mb-4">
                <div class="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="listSearchQuery"
                  type="text"
                  class="w-full h-10 pl-10 pr-10 rounded-xl border theme-panel text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 theme-text-primary placeholder:theme-text-muted transition-shadow"
                  :placeholder="t('products.searchBoxPlaceholder')"
                  @keydown.enter="listOnSearch"
                />
                <button
                  v-if="listSearchQuery"
                  type="button"
                  class="absolute inset-y-0 right-3 flex items-center theme-text-muted hover:theme-text-primary transition-colors"
                  @click="listClearSearch"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Loading Skeleton -->
              <div v-if="listLoading" class="space-y-6">
                <div v-for="i in 3" :key="i">
                  <div class="flex items-center gap-2 mb-3 px-0.5">
                    <div class="h-5 w-5 rounded theme-skeleton"></div>
                    <div class="h-4 w-28 rounded theme-skeleton"></div>
                  </div>
                  <div class="space-y-2">
                    <div v-for="j in 3" :key="j"
                      class="theme-panel rounded-xl border flex items-center h-[72px]">
                      <div class="w-14 h-14 m-2 rounded-lg theme-skeleton flex-shrink-0"></div>
                      <div class="flex-1 px-3 py-2 space-y-2">
                        <div class="h-3.5 w-1/3 rounded theme-skeleton"></div>
                        <div class="h-3 w-1/4 rounded theme-skeleton"></div>
                      </div>
                      <div class="px-4 py-2">
                        <div class="h-4 w-14 rounded theme-skeleton"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grouped Product List -->
              <div v-else-if="listProductGroups.length > 0" class="space-y-6">
                <div v-for="group in listProductGroups" :key="group.categoryId ?? 'uncategorized'">
                  <!-- Category Header -->
                  <div class="flex items-center gap-2 mb-3 px-0.5">
                    <span class="w-1 h-5 rounded-full theme-accent-stick flex-shrink-0"></span>
                    <img v-if="group.categoryIcon" :src="getImageUrl(group.categoryIcon)"
                      :alt="group.categoryName" loading="lazy" class="h-5 w-5 rounded object-cover flex-shrink-0" />
                    <span class="text-sm font-semibold theme-text-primary truncate">{{ group.categoryName }}</span>
                    <span class="text-xs theme-text-muted">({{ group.products.length }})</span>
                  </div>
                  <!-- Products in this category -->
                  <div class="space-y-2">
                    <ProductListItem
                      v-for="(product, idx) in group.products"
                      :key="product.id"
                      :product="product"
                      :index="idx"
                      :animation-step="20"
                      @click="goToProduct"
                      @quick-buy="openQuickBuy"
                    />
                  </div>
                </div>

                <PaginationNav
                  :current-page="listCurrentPage"
                  :total-pages="listTotalPages"
                  compact
                  @change-page="listChangePage"
                />
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-16 border theme-panel-soft rounded-2xl backdrop-blur-sm">
                <svg class="w-16 h-16 mx-auto theme-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="theme-text-muted text-lg">{{ t('products.empty') }}</p>
              </div>
            </main>
          </div>
        </div>
      </section>
    </template>

    <!-- ==================== CARD MODE (default) ==================== -->
    <template v-else>
    <section id="featured" class="relative z-10 pb-14 pt-32 md:pt-36">
      <div class="container mx-auto px-4">
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 class="theme-section-heading text-3xl md:text-4xl">{{ t('home.featured.title') }}</h2>
            <p class="mt-2 text-sm theme-text-secondary">{{ t('home.featured.description') }}</p>
          </div>
          <router-link
            to="/products"
            class="text-sm font-semibold theme-link-muted"
          >
            {{ t('home.featured.viewAll') }}
          </router-link>
        </div>

        <div v-if="products.length > 0" class="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <ProductCard
            v-for="(product, idx) in products"
            :key="product.id"
            :product="product"
            :index="idx"
            :animation-step="60"
            @click="goToProduct"
            @quick-buy="openQuickBuy"
          />
        </div>
        <div v-else class="rounded-2xl border border-dashed theme-border py-16 text-center theme-text-muted theme-slide-up">
          <svg class="mx-auto h-16 w-16 mb-4 theme-text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          {{ t('home.featured.empty') }}
        </div>
      </div>
    </section>

    <template v-if="latestSectionVisible">
    <hr class="theme-section-divider mx-4 md:mx-auto md:max-w-6xl" />

    <section class="relative z-10 py-12">
      <div class="container mx-auto px-4">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 class="theme-section-heading text-[1.7rem]">{{ t('home.latest.title') }}</h2>
            <p class="mt-1 text-sm theme-text-secondary">{{ t('home.latest.description') }}</p>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <router-link v-if="blogEnabled" to="/blog" class="theme-link-muted">{{ t('nav.blog') }}</router-link>
            <router-link v-if="noticeEnabled" to="/notice" class="theme-link-muted">{{ t('nav.notice') }}</router-link>
          </div>
        </div>

        <div v-if="posts.length > 0" class="grid grid-cols-1 gap-5 md:grid-cols-3">
          <article
            v-for="post in posts"
            :key="post.id"
            class="cursor-pointer rounded-xl border theme-panel p-5 transition hover:shadow-md"
            @click="goToPost(post.slug)"
          >
            <div class="mb-2 text-xs theme-text-muted">{{ formatDate(post.created_at) }}</div>
            <h3 class="line-clamp-2 text-base font-semibold">{{ getLocalizedText(post.title) }}</h3>
            <p class="mt-2 line-clamp-2 text-sm theme-text-secondary">{{ getLocalizedText(post.summary) }}</p>
            <div class="mt-4 text-sm font-medium theme-link">{{ t('blog.readMore') }}</div>
          </article>
        </div>
        <div v-else class="rounded-2xl border border-dashed theme-border py-12 text-center theme-text-muted">
          {{ t('blog.empty') }}
        </div>
      </div>
    </section>
    </template>
    </template>

    <ProductQuickBuy
      v-if="quickBuyProduct"
      :product="quickBuyProduct"
      :visible="quickBuyVisible"
      @update:visible="quickBuyVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { postAPI, productAPI } from '../api'
import { getImageUrl } from '../utils/image'
import { useLocalized } from '../composables/useProduct'
import { useProductList } from '../composables/useProductList'
import { useProductListGroups } from '../composables/useProductListGroups'
import { useAppStore } from '../stores/app'
import ProductCard from '../components/ProductCard.vue'
import ProductListItem from '../components/ProductListItem.vue'
import ProductQuickBuy from '../components/ProductQuickBuy.vue'
import CategorySidebar from '../components/CategorySidebar.vue'
import PaginationNav from '../components/PaginationNav.vue'

const router = useRouter()
const { t } = useI18n()
const { getLocalizedText } = useLocalized()
const appStore = useAppStore()

const templateMode = computed(() => appStore.config?.template_mode || 'card')
const navBuiltin = computed(() => (appStore.config?.nav_config as { builtin?: Record<string, boolean> } | undefined)?.builtin)
const blogEnabled = computed(() => navBuiltin.value?.blog !== false)
const noticeEnabled = computed(() => navBuiltin.value?.notice !== false)
const latestSectionVisible = computed(() => blogEnabled.value || noticeEnabled.value)

// ==================== Shared State ====================
const products = ref<any[]>([])
const posts = ref<any[]>([])
const quickBuyProduct = ref<any>(null)
const quickBuyVisible = ref(false)

// Open the quick-buy panel for the selected product.
const openQuickBuy = (product: any) => {
  quickBuyProduct.value = product
  quickBuyVisible.value = true
}

// ==================== List Mode ====================
const {
  loading: listLoading,
  products: listProducts,
  selectedCategory: listSelectedCategory,
  searchQuery: listSearchQuery,
  currentPage: listCurrentPage,
  totalPages: listTotalPages,
  showFilterDrawer: listShowFilterDrawer,
  expandedParentIds: listExpandedParentIds,
  categoryGroups: listCategoryGroups,
  categoryMap: listCategoryMap,
  selectCategory: listSelectCategory,
  toggleParentCategory: listToggleParentCategory,
  changePage: listChangePage,
  clearSearch: listClearSearch,
  onSearch: listOnSearch,
  initialize: listInitialize,
  cleanup: listCleanup,
} = useProductList({ pageSize: 20, homeRouteName: 'home' })

const listProductGroups = useProductListGroups(listProducts, listCategoryMap)

// ==================== Card Mode ====================
// Format post publish dates for the latest content cards.
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Navigate to the product detail page.
const goToProduct = (slug: string) => {
  router.push(`/products/${slug}`)
}

// Navigate to the blog detail page.
const goToPost = (slug: string) => {
  router.push(`/blog/${slug}`)
}

// Load featured products for the card-style homepage.
const loadFeaturedProducts = async () => {
  try {
    const response = await productAPI.list({ page: 1, page_size: 15 })
    products.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

// Load the latest posts or notices shown on the homepage.
const loadLatestPosts = async () => {
  if (!latestSectionVisible.value) return
  try {
    const params: Record<string, unknown> = { page: 1, page_size: 3 }
    if (blogEnabled.value && !noticeEnabled.value) params.type = 'blog'
    if (!blogEnabled.value && noticeEnabled.value) params.type = 'notice'
    const response = await postAPI.list(params)
    posts.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load posts:', error)
  }
}

// ==================== Lifecycle ====================
onMounted(async () => {
  if (templateMode.value === 'list') {
    await listInitialize()
  } else {
    await Promise.all([loadFeaturedProducts(), loadLatestPosts()])
  }
})

onUnmounted(() => {
  listCleanup()
})
</script>

<style scoped>
.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 300ms ease;
}
.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
}
</style>
