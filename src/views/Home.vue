<template>
  <div class="home-page min-h-screen theme-page">

    <!-- ==================== LIST MODE ==================== -->
    <template v-if="templateMode === 'list'">
      <!-- Hero Banner (shared with card mode) -->
      <section v-if="showHeroSection" class="relative z-10 border-b theme-border pt-24 pb-10">
        <div class="container mx-auto px-4">
          <div class="relative overflow-hidden rounded-2xl border theme-panel"
            @touchstart="onBannerTouchStart"
            @touchend="onBannerTouchEnd">
            <Transition name="banner-fade" mode="out-in">
              <img v-if="!bannerLoading && heroImage" :src="heroImage" :key="heroImage" class="absolute inset-0 h-full w-full object-cover" />
            </Transition>
            <div class="absolute inset-0 bg-black/50"></div>
            <div v-if="bannerLoading" class="relative flex min-h-[200px] flex-col justify-between p-5 sm:min-h-[240px] sm:p-6 md:min-h-[320px] md:p-10">
              <div class="space-y-3">
                <div class="h-5 w-24 theme-skeleton rounded-full" style="background: rgba(255,255,255,0.35)"></div>
                <div class="h-8 max-w-3xl theme-skeleton rounded-xl md:h-10" style="background: rgba(255,255,255,0.35)"></div>
                <div class="h-4 max-w-2xl theme-skeleton rounded-lg" style="background: rgba(255,255,255,0.3)"></div>
              </div>
            </div>
            <div v-else class="relative flex min-h-[200px] flex-col justify-between p-5 sm:min-h-[240px] sm:p-6 md:min-h-[320px] md:p-10">
              <div v-if="bannerCount > 1" class="mb-3 flex items-center justify-end gap-2">
                <button type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white transition hover:bg-black/35 md:h-9 md:w-9"
                  @click="handlePrevHeroBanner" :aria-label="t('common.previousBanner')">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white transition hover:bg-black/35 md:h-9 md:w-9"
                  @click="handleNextHeroBanner" :aria-label="t('common.nextBanner')">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div class="space-y-2 sm:space-y-3">
                <span class="theme-badge theme-badge-inverse gap-2 text-xs font-semibold uppercase tracking-wider">
                  <span class="h-2 w-2 rounded-full bg-emerald-300"></span>
                  {{ heroBadge }}
                </span>
                <h1 class="max-w-4xl text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl md:text-3xl">
                  {{ heroTitle }}
                </h1>
                <p class="max-w-3xl text-xs leading-relaxed text-gray-100 sm:text-sm">
                  {{ heroSubtitle }}
                </p>
              </div>
              <div v-if="bannerCount > 1" class="mt-4 flex items-center gap-2">
                <button v-for="(_, bIdx) in banners" :key="`list-dot-${bIdx}`" type="button"
                  class="h-2 rounded-full transition-all"
                  :class="bIdx === currentBannerIndex ? 'w-6 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'"
                  @click="selectHeroBanner(bIdx)"></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main: Left Categories + Right Product List -->
      <section class="relative z-10 pb-6" :class="showHeroSection ? 'pt-6' : 'pt-24'">
        <div class="container mx-auto px-4">
          <div class="flex flex-col lg:flex-row gap-6">

            <!-- Mobile Filter Button -->
            <button @click="listShowFilterDrawer = true"
              class="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border theme-btn-secondary text-sm font-medium min-h-[44px]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {{ t('products.filter') }}
              <span v-if="listSelectedCategory" class="w-2 h-2 rounded-full theme-accent-stick"></span>
            </button>

            <!-- Mobile Filter Drawer Overlay -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0">
              <div v-if="listShowFilterDrawer" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="listShowFilterDrawer = false"></div>
            </Transition>

            <!-- Mobile Filter Drawer -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="-translate-x-full"
              enter-to-class="translate-x-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="translate-x-0"
              leave-to-class="-translate-x-full">
              <div v-if="listShowFilterDrawer"
                class="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[80vw] theme-panel-strong backdrop-blur-xl border-r theme-border overflow-y-auto">
                <div class="p-6">
                  <div class="flex items-center justify-between mb-6">
                    <span class="text-sm font-bold theme-text-primary flex items-center gap-2">
                      <span class="w-1 h-5 theme-accent-stick rounded-full"></span>
                      {{ t('products.categories') }}
                    </span>
                    <button @click="listShowFilterDrawer = false"
                      class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg theme-btn-neutral">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <ul class="space-y-2">
                    <li>
                      <button @click="selectListCategory(null, true)"
                        class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border min-h-[44px]"
                        :class="listSelectedCategory === null
                          ? 'theme-btn-primary border border-transparent'
                          : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                        {{ t('products.allCategories') }}
                      </button>
                    </li>
                    <li v-for="group in listCategoryGroups" :key="group.id">
                      <div class="space-y-2">
                        <div class="flex items-stretch gap-2">
                          <button @click="selectListCategory(group.id, true)"
                            class="flex-1 text-left px-4 py-3 rounded-xl transition-all duration-300 border flex items-center gap-2 min-h-[44px]"
                            :class="listSelectedCategory === group.id
                              ? 'theme-btn-primary border border-transparent'
                              : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                            <img v-if="group.icon" :src="getImageUrl(group.icon)"
                              :alt="getLocalizedText(group.name)"
                              class="h-5 w-5 rounded object-cover" />
                            <span class="truncate">{{ getLocalizedText(group.name) }}</span>
                          </button>
                          <button
                            v-if="group.children.length > 0"
                            type="button"
                            class="h-10 w-10 shrink-0 self-center rounded-full border flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                            :class="listExpandedParentIds.includes(group.id) ? 'theme-btn-primary border-transparent' : 'theme-panel-soft theme-text-muted hover:text-gray-900 dark:hover:text-white'"
                            @click.stop="toggleListParentCategory(group.id)"
                          >
                            <svg class="w-4 h-4 transition-transform duration-200"
                              :class="listExpandedParentIds.includes(group.id) ? 'rotate-90' : ''"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        <ul v-if="group.children.length > 0 && listExpandedParentIds.includes(group.id)" class="space-y-2 pl-4">
                          <li v-for="child in group.children" :key="child.id">
                            <button @click="selectListCategory(child.id, true)"
                              class="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border flex items-center gap-2 min-h-[44px]"
                              :class="listSelectedCategory === child.id
                                ? 'theme-btn-primary border border-transparent'
                                : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                              <img v-if="child.icon" :src="getImageUrl(child.icon)"
                                :alt="getLocalizedText(child.name)"
                                class="h-5 w-5 rounded object-cover" />
                              <span class="truncate">{{ getLocalizedText(child.name) }}</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </Transition>

            <!-- Desktop Sidebar - Categories -->
            <aside class="hidden lg:block lg:w-60 flex-shrink-0">
              <div class="theme-panel backdrop-blur-xl border rounded-2xl p-5 sticky top-24">
                <h2 class="text-base font-bold mb-4 theme-text-primary flex items-center gap-2">
                  <span class="w-1 h-5 theme-accent-stick rounded-full"></span>
                  {{ t('products.categories') }}
                </h2>
                <ul class="space-y-1.5">
                  <li>
                    <button @click="selectListCategory(null)"
                      class="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 border text-sm"
                      :class="listSelectedCategory === null
                        ? 'theme-btn-primary border border-transparent'
                        : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                      {{ t('products.allCategories') }}
                    </button>
                  </li>
                  <li v-for="group in listCategoryGroups" :key="group.id">
                    <div class="space-y-1.5">
                      <div class="flex items-stretch gap-1.5">
                        <button @click="selectListCategory(group.id)"
                          class="flex-1 text-left px-3 py-2.5 rounded-xl transition-all duration-300 border flex items-center gap-2 text-sm"
                          :class="listSelectedCategory === group.id
                            ? 'theme-btn-primary border border-transparent'
                            : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                          <img v-if="group.icon" :src="getImageUrl(group.icon)"
                            :alt="getLocalizedText(group.name)"
                            class="h-4 w-4 rounded object-cover" />
                          <span class="truncate">{{ getLocalizedText(group.name) }}</span>
                        </button>
                        <button
                          v-if="group.children.length > 0"
                          type="button"
                          class="h-9 w-9 shrink-0 self-center rounded-full border flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                          :class="listExpandedParentIds.includes(group.id) ? 'theme-btn-primary border-transparent' : 'theme-panel-soft theme-text-muted hover:text-gray-900 dark:hover:text-white'"
                          @click.stop="toggleListParentCategory(group.id)"
                        >
                          <svg class="w-3.5 h-3.5 transition-transform duration-200"
                            :class="listExpandedParentIds.includes(group.id) ? 'rotate-90' : ''"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      <ul v-if="group.children.length > 0 && listExpandedParentIds.includes(group.id)" class="space-y-1.5 pl-3">
                        <li v-for="child in group.children" :key="child.id">
                          <button @click="selectListCategory(child.id)"
                            class="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 border flex items-center gap-2 text-sm"
                            :class="listSelectedCategory === child.id
                              ? 'theme-btn-primary border border-transparent'
                              : 'border-transparent theme-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'">
                            <img v-if="child.icon" :src="getImageUrl(child.icon)"
                              :alt="getLocalizedText(child.name)"
                              class="h-4 w-4 rounded object-cover" />
                            <span class="truncate">{{ getLocalizedText(child.name) }}</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </aside>

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
                  @keydown.enter="onListSearch"
                />
                <button
                  v-if="listSearchQuery"
                  type="button"
                  class="absolute inset-y-0 right-3 flex items-center theme-text-muted hover:theme-text-primary transition-colors"
                  @click="clearListSearch"
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
                      :alt="group.categoryName" class="h-5 w-5 rounded object-cover flex-shrink-0" />
                    <span class="text-sm font-semibold theme-text-primary">{{ group.categoryName }}</span>
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

                <!-- Pagination -->
                <div v-if="listTotalPages > 1" class="mt-8 flex justify-center">
                  <nav class="flex items-center space-x-2 theme-panel-soft backdrop-blur-md p-2 rounded-2xl border">
                    <button @click="changeListPage(listCurrentPage - 1)" :disabled="listCurrentPage === 1"
                      class="w-10 h-10 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span class="px-3 py-1.5 font-mono theme-text-muted text-sm">
                      <span class="theme-text-primary font-bold">{{ listCurrentPage }}</span>
                      <span class="mx-1.5 opacity-50">/</span>
                      <span>{{ listTotalPages }}</span>
                    </span>
                    <button @click="changeListPage(listCurrentPage + 1)" :disabled="listCurrentPage === listTotalPages"
                      class="w-10 h-10 flex items-center justify-center rounded-xl border theme-btn-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
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
    <section v-if="showHeroSection" class="relative z-10 border-b theme-border pt-24 pb-10">
      <div class="container mx-auto px-4">
        <div class="relative overflow-hidden rounded-2xl border theme-panel"
          @touchstart="onBannerTouchStart"
          @touchend="onBannerTouchEnd">
          <!-- Banner image with fade transition -->
          <Transition name="banner-fade" mode="out-in">
            <img v-if="!bannerLoading && heroImage" :src="heroImage" :key="heroImage" class="absolute inset-0 h-full w-full object-cover" />
          </Transition>
          <div class="absolute inset-0 bg-black/50"></div>

            <div v-if="bannerLoading" class="relative flex min-h-[260px] flex-col justify-between p-5 sm:min-h-[320px] sm:p-6 md:min-h-[420px] md:p-12">
            <div class="mb-4 flex items-center justify-end">
              <span class="theme-badge theme-badge-inverse text-xs font-medium">
                {{ t('common.loading') }}
              </span>
            </div>

            <div class="space-y-4">
              <div class="h-6 w-28 theme-skeleton rounded-full" style="background: rgba(255,255,255,0.35)"></div>
              <div class="h-10 max-w-4xl theme-skeleton rounded-xl md:h-14" style="background: rgba(255,255,255,0.35)"></div>
              <div class="h-5 max-w-3xl theme-skeleton rounded-lg" style="background: rgba(255,255,255,0.3)"></div>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-6">
              <div class="h-11 w-36 theme-skeleton rounded-lg" style="background: rgba(255,255,255,0.35)"></div>
              <div class="h-11 w-28 theme-skeleton rounded-lg" style="background: rgba(255,255,255,0.25)"></div>
            </div>
          </div>

          <div v-else class="relative flex min-h-[260px] flex-col justify-between p-5 sm:min-h-[320px] sm:p-6 md:min-h-[420px] md:p-12">
            <div v-if="bannerCount > 1" class="mb-4 flex items-center justify-end gap-2">
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white transition hover:bg-black/35 md:h-10 md:w-10"
                @click="handlePrevHeroBanner"
                :aria-label="t('common.previousBanner')"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white transition hover:bg-black/35 md:h-10 md:w-10"
                @click="handleNextHeroBanner"
                :aria-label="t('common.nextBanner')"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div class="space-y-3 sm:space-y-4">
              <span class="theme-badge theme-badge-inverse gap-2 text-xs font-semibold uppercase tracking-wider">
                <span class="h-2 w-2 rounded-full bg-emerald-300"></span>
                {{ heroBadge }}
              </span>
              <h1 class="max-w-4xl text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl md:text-[2.85rem]">
                {{ heroTitle }}
              </h1>
              <p class="max-w-3xl text-xs leading-relaxed text-gray-100 sm:text-sm md:text-base">
                {{ heroSubtitle }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 pt-5 sm:pt-6">
              <button
                type="button"
                @click="goToHeroLink"
                class="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:scale-105 sm:min-h-[44px] sm:px-5 sm:py-3"
              >
                {{ heroPrimaryButtonText }}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <router-link
                v-if="!hasHeroLink"
                to="/products"
                class="inline-flex min-h-[40px] items-center rounded-lg border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10 sm:min-h-[44px] sm:px-5 sm:py-3"
              >
                {{ t('home.featured.viewAll') }}
              </router-link>
            </div>

            <div v-if="bannerCount > 1" class="mt-5 flex items-center gap-2">
              <button
                v-for="(_, index) in banners"
                :key="`hero-dot-${index}`"
                type="button"
                class="h-2.5 rounded-full transition-all"
                :class="index === currentBannerIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'"
                @click="selectHeroBanner(index)"
                :aria-label="t('common.switchBanner', { n: index + 1 })"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="featured" class="relative z-10 pb-14" :class="showHeroSection ? 'pt-14' : 'pt-32 md:pt-36'">
      <div class="container mx-auto px-4">
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 class="theme-section-heading text-3xl md:text-4xl">{{ t('home.featured.title') }}</h2>
            <p class="mt-2 text-sm theme-text-secondary">{{ t('home.featured.description') }}</p>
          </div>
          <router-link
                v-if="!hasHeroLink"
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

    <hr class="theme-section-divider mx-4 md:mx-auto md:max-w-6xl" />

    <section class="relative z-10 py-12">
      <div class="container mx-auto px-4">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 class="theme-section-heading text-[1.7rem]">{{ t('home.latest.title') }}</h2>
            <p class="mt-1 text-sm theme-text-secondary">{{ t('home.latest.description') }}</p>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <router-link to="/blog" class="theme-link-muted">{{ t('nav.blog') }}</router-link>
            <router-link to="/notice" class="theme-link-muted">{{ t('nav.notice') }}</router-link>
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

    <ProductQuickBuy
      v-if="quickBuyProduct"
      :product="quickBuyProduct"
      :visible="quickBuyVisible"
      @update:visible="quickBuyVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { bannerAPI, categoryAPI, postAPI, productAPI } from '../api'
import { buildCategoryGroups, createCategoryMap, normalizeCategoryParentId, type PublicCategory } from '../utils/category'
import { getImageUrl } from '../utils/image'
import { debounceAsync } from '../utils/debounce'
import { useLocalized } from '../composables/useProduct'
import { useAppStore } from '../stores/app'
import ProductCard from '../components/ProductCard.vue'
import ProductListItem from '../components/ProductListItem.vue'
import ProductQuickBuy from '../components/ProductQuickBuy.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { getLocalizedText } = useLocalized()
const appStore = useAppStore()

const templateMode = computed(() => appStore.config?.template_mode || 'card')

const products = ref<any[]>([])
const posts = ref<any[]>([])
const banners = ref<any[]>([])
const quickBuyProduct = ref<any>(null)
const quickBuyVisible = ref(false)

const openQuickBuy = (product: any) => {
  quickBuyProduct.value = product
  quickBuyVisible.value = true
}
const bannerLoading = ref(true)

const currentBannerIndex = ref(0)
let heroAutoPlayTimer: ReturnType<typeof setInterval> | null = null

// Touch swipe for banner
let touchStartX = 0
const onBannerTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0]?.clientX ?? 0
}
const onBannerTouchEnd = (e: TouchEvent) => {
  const diff = touchStartX - (e.changedTouches[0]?.clientX ?? 0)
  if (Math.abs(diff) > 50) {
    if (diff > 0) handleNextHeroBanner()
    else handlePrevHeroBanner()
  }
}

const bannerCount = computed(() => banners.value.length)
const showHeroSection = computed(() => bannerLoading.value || bannerCount.value > 0)

const heroBanner = computed(() => {
  if (banners.value.length === 0) return null
  if (currentBannerIndex.value >= banners.value.length) return banners.value[0]
  return banners.value[currentBannerIndex.value]
})

const goToBanner = (index: number) => {
  if (banners.value.length === 0) return
  const total = banners.value.length
  currentBannerIndex.value = ((index % total) + total) % total
}

const nextHeroBanner = () => {
  goToBanner(currentBannerIndex.value + 1)
}

const prevHeroBanner = () => {
  goToBanner(currentBannerIndex.value - 1)
}

const stopHeroAutoPlay = () => {
  if (heroAutoPlayTimer) {
    clearInterval(heroAutoPlayTimer)
    heroAutoPlayTimer = null
  }
}

const startHeroAutoPlay = () => {
  stopHeroAutoPlay()
  if (banners.value.length <= 1) return
  heroAutoPlayTimer = setInterval(() => {
    nextHeroBanner()
  }, 5000)
}

const handleNextHeroBanner = () => {
  nextHeroBanner()
  startHeroAutoPlay()
}

const handlePrevHeroBanner = () => {
  prevHeroBanner()
  startHeroAutoPlay()
}

const selectHeroBanner = (index: number) => {
  goToBanner(index)
  startHeroAutoPlay()
}

const heroImage = computed(() => {
  const banner = heroBanner.value
  if (!banner) return ''
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  if (isMobile && banner.mobile_image) {
    return getImageUrl(banner.mobile_image)
  }
  return getImageUrl(banner.image || banner.mobile_image || '')
})

const heroBadge = computed(() => {
  if (!heroBanner.value) return t('home.hero.badge')
  return getLocalizedText(heroBanner.value.title) || t('home.hero.badge')
})

const heroTitle = computed(() => {
  if (!heroBanner.value) return t('home.hero.title')
  return getLocalizedText(heroBanner.value.title) || t('home.hero.title')
})

const heroSubtitle = computed(() => {
  if (!heroBanner.value) return t('home.hero.subtitle')
  return getLocalizedText(heroBanner.value.subtitle) || t('home.hero.subtitle')
})

const heroLink = computed(() => {
  const banner = heroBanner.value
  if (!banner || banner.link_type === 'none') return ''
  return banner.link_value || ''
})

const hasHeroLink = computed(() => heroLink.value.trim().length > 0)

const heroPrimaryButtonText = computed(() => {
  if (!hasHeroLink.value) return t('home.hero.cta')
  const linkType = String(heroBanner.value?.link_type || '').toLowerCase()
  if (linkType === 'external') {
    return t('common.learnMore')
  }
  return t('common.viewDetails')
})

const heroOpenInNewTab = computed(() => Boolean(heroBanner.value?.open_in_new_tab))

const goToHeroLink = () => {
  if (!heroLink.value) {
    router.push('/products')
    return
  }
  const isExternal = /^https?:\/\//i.test(heroLink.value)
  if (isExternal || heroOpenInNewTab.value) {
    window.open(heroLink.value, heroOpenInNewTab.value ? '_blank' : '_self')
    return
  }
  router.push(heroLink.value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const goToProduct = (slug: string) => {
  router.push(`/products/${slug}`)
}

const goToPost = (slug: string) => {
  router.push(`/blog/${slug}`)
}

const loadFeaturedProducts = async () => {
  try {
    const response = await productAPI.list({ page: 1, page_size: 15 })
    products.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadLatestPosts = async () => {
  try {
    const response = await postAPI.list({ page: 1, page_size: 3 })
    posts.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load posts:', error)
  }
}

const loadHeroBanners = async () => {
  bannerLoading.value = true
  try {
    const response = await bannerAPI.list({ position: 'home_hero', limit: 5 })
    banners.value = response.data.data || []
    currentBannerIndex.value = 0
    startHeroAutoPlay()
  } catch (error) {
    banners.value = []
    currentBannerIndex.value = 0
    stopHeroAutoPlay()
    console.error('Failed to load banners:', error)
  } finally {
    bannerLoading.value = false
  }
}

// ==================== List Mode State ====================
const listSearchQuery = ref('')
const listSelectedCategory = ref<number | null>(null)
const listCategories = ref<PublicCategory[]>([])
const listProducts = ref<any[]>([])
const listLoading = ref(true)
const listCurrentPage = ref(1)
const listPageSize = ref(20)
const listTotalPages = ref(0)
const listShowFilterDrawer = ref(false)
const listExpandedParentIds = ref<number[]>([])

const listCategoryGroups = computed(() => buildCategoryGroups(listCategories.value))
const listCategoryMap = computed(() => createCategoryMap(listCategories.value))

// Group products by top-level (parent) category for display
interface ListProductGroup {
  categoryId: number | null
  categoryName: string
  categoryIcon: string | null
  products: any[]
}

const listProductGroups = computed<ListProductGroup[]>(() => {
  if (listProducts.value.length === 0) return []

  const catMap = listCategoryMap.value
  const groupMap = new Map<number | null, ListProductGroup>()
  const orderedKeys: (number | null)[] = []

  for (const product of listProducts.value) {
    const directCatId: number | null = product.category?.id ?? null

    // Resolve to top-level parent category
    let groupCatId = directCatId
    let groupName = directCatId !== null ? getLocalizedText(product.category?.name) : t('products.allCategories')
    let groupIcon: string | null = product.category?.icon ?? null

    if (directCatId !== null) {
      const catEntry = catMap.get(directCatId)
      if (catEntry) {
        const parentId = normalizeCategoryParentId(catEntry.parent_id)
        if (parentId > 0) {
          const parentEntry = catMap.get(parentId)
          if (parentEntry) {
            groupCatId = parentEntry.id
            groupName = getLocalizedText(parentEntry.name)
            groupIcon = parentEntry.icon ?? null
          }
        }
      }
    }

    if (!groupMap.has(groupCatId)) {
      orderedKeys.push(groupCatId)
      groupMap.set(groupCatId, {
        categoryId: groupCatId,
        categoryName: groupName,
        categoryIcon: groupIcon,
        products: [],
      })
    }
    groupMap.get(groupCatId)!.products.push(product)
  }

  return orderedKeys.map((key) => groupMap.get(key)!)
})

const loadListCategories = async () => {
  try {
    const response = await categoryAPI.list()
    listCategories.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadListProducts = async () => {
  listLoading.value = true
  try {
    const params: any = {
      page: listCurrentPage.value,
      page_size: listPageSize.value,
    }
    if (listSelectedCategory.value) {
      params.category_id = listSelectedCategory.value
    }
    const keyword = listSearchQuery.value.trim()
    if (keyword) {
      params.search = keyword
    }
    const response = await productAPI.list(params)
    listProducts.value = response.data.data || []
    if (response.data.pagination) {
      listTotalPages.value = response.data.pagination.total_page || 0
    }
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    listLoading.value = false
  }
}

const debouncedLoadListProducts = debounceAsync(loadListProducts, 300)
let listInitializing = true

const selectListCategory = (categoryId: number | null, closeDrawer = false) => {
  listSelectedCategory.value = categoryId
  listCurrentPage.value = 1
  if (closeDrawer) {
    listShowFilterDrawer.value = false
  }
}

const toggleListParentCategory = (categoryId: number) => {
  const idx = listExpandedParentIds.value.indexOf(categoryId)
  if (idx >= 0) {
    listExpandedParentIds.value.splice(idx, 1)
  } else {
    listExpandedParentIds.value.push(categoryId)
  }
}

const onListSearch = () => {
  listCurrentPage.value = 1
  debouncedLoadListProducts()
}

const clearListSearch = () => {
  listSearchQuery.value = ''
  listCurrentPage.value = 1
  debouncedLoadListProducts()
}

const changeListPage = (page: number) => {
  if (page < 1 || page > listTotalPages.value) return
  listCurrentPage.value = page
  debouncedLoadListProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Sync category from URL (e.g. /categories/test)
const syncListCategoryFromRoute = () => {
  if (route.name !== 'category-products') {
    if (listSelectedCategory.value !== null) {
      listSelectedCategory.value = null
    }
    return false
  }
  const slugParam = route.params.slug as string | undefined
  if (!slugParam || listCategories.value.length === 0) return false

  const matched = listCategories.value.find((c) => c.slug === slugParam)
  if (!matched) return false

  if (listSelectedCategory.value !== matched.id) {
    listSelectedCategory.value = matched.id
  }
  return true
}

// Expand parent category when a child is selected
const syncListExpandedState = () => {
  if (!listSelectedCategory.value) return
  const catEntry = listCategoryMap.value.get(listSelectedCategory.value)
  if (!catEntry) return
  const parentId = normalizeCategoryParentId(catEntry.parent_id)
  if (parentId > 0 && !listExpandedParentIds.value.includes(parentId)) {
    listExpandedParentIds.value.push(parentId)
  } else {
    const group = listCategoryGroups.value.find((g) => g.id === catEntry.id)
    if (group?.children.length && !listExpandedParentIds.value.includes(group.id)) {
      listExpandedParentIds.value.push(group.id)
    }
  }
}

// Watch category selection → sync URL + load products
watch(listSelectedCategory, () => {
  if (listInitializing) return
  listCurrentPage.value = 1
  syncListExpandedState()
  debouncedLoadListProducts()

  // Sync URL
  if (listSelectedCategory.value) {
    const matched = listCategories.value.find((c) => c.id === listSelectedCategory.value)
    if (matched?.slug && route.params.slug !== matched.slug) {
      router.replace({ name: 'category-products', params: { slug: matched.slug } })
    }
  } else if (route.name === 'category-products') {
    router.replace({ name: 'home' })
  }
})

watch(listSearchQuery, () => {
  if (listInitializing) return
  listCurrentPage.value = 1
  debouncedLoadListProducts()
})

// Watch route slug changes (browser back/forward)
watch(
  () => route.params.slug,
  () => {
    if (listInitializing || templateMode.value !== 'list') return
    if (listCategories.value.length === 0) return
    syncListCategoryFromRoute()
  },
)

onMounted(async () => {
  if (templateMode.value === 'list') {
    await Promise.all([loadHeroBanners(), loadListCategories()])
    if (syncListCategoryFromRoute()) {
      syncListExpandedState()
    }
    await loadListProducts()
    listInitializing = false
  } else {
    await Promise.all([loadHeroBanners(), loadFeaturedProducts(), loadLatestPosts()])
  }
})

onUnmounted(() => {
  stopHeroAutoPlay()
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
