<template>
  <div>
    <CarouselModuleCarouselAgnostic
      v-if="isReady"
      v-slot="{ item }"
      :items="drops"
      :step="steps"
      :breakpoints="breakpoints">
      <DropsDropCard :drop="item" />
    </CarouselModuleCarouselAgnostic>
    <CarouselModuleCarouselAgnostic
      v-else
      :items="Array(DROP_SKELETON_COUNT).fill({ id: 'drop-skeleton' })"
      :step="steps"
      :breakpoints="breakpoints">
      <DropsDropCardSkeleton />
    </CarouselModuleCarouselAgnostic>
  </div>
</template>

<script lang="ts" setup>
import { type CarouseBreakpointsConfig } from '@/components/carousel/module/CarouselAgnostic.vue'
import { useDrops } from '@/components/drops/useDrops'

const DROP_SKELETON_COUNT = 3

const breakpoints: CarouseBreakpointsConfig = {
  '640px': { slides: { perView: 1.2, spacing: 16 } },
  '768px': {
    slides: { perView: 2.2, spacing: 16 },
  },
  '1024px': {
    slides: { perView: 3, spacing: 32 },
  },
  '1280px': {
    slides: { perView: 3, spacing: 32 },
  },
  '1540px': {
    slides: { perView: 3, spacing: 32 },
  },
}

const { drops, loaded: isReady } = useDrops({
  limit: 6,
  active: [true, false],
})
const { width } = useWindowSize()

const steps = computed(() => {
  if (width.value > 1024) {
    return 3
  }
  if (width.value > 768) {
    return 2
  }
  return 1
})
</script>
