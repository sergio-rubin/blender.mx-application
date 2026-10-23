<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";

import { gallery } from "@/data/property";

const index = ref(0);
const loaded = ref<Record<number, boolean>>({});
const current = computed(() => gallery[index.value] ?? gallery[0]);

function select(next: number) {
  index.value = (next + gallery.length) % gallery.length;
}

function onKeyboard(event: KeyboardEvent) {
  if (event.key === "ArrowLeft") select(index.value - 1);
  if (event.key === "ArrowRight") select(index.value + 1);
}

onMounted(() => {
  gallery.slice(1).forEach(({ src }) => {
    const image = new Image();
    image.src = src;
  });
});
</script>

<template>
  <section class="gallery" aria-roledescription="carrusel" aria-label="Galería del departamento" @keydown="onKeyboard">
    <div class="gallery-stage">
      <div v-if="!loaded[index]" class="image-skeleton" aria-hidden="true" />
      <Transition name="gallery-fade" mode="out-in">
        <img
          :key="current?.src"
          class="gallery-image"
          :src="current?.src"
          :alt="current?.alt"
          width="1600"
          height="1072"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          @load="loaded[index] = true"
        >
      </Transition>
      <button class="gallery-arrow is-left" type="button" aria-label="Foto anterior" @click="select(index - 1)">
        <ChevronLeft :size="24" :stroke-width="1.5" />
      </button>
      <button class="gallery-arrow is-right" type="button" aria-label="Foto siguiente" @click="select(index + 1)">
        <ChevronRight :size="24" :stroke-width="1.5" />
      </button>
      <p class="gallery-count" aria-live="polite">
        {{ index + 1 }} / {{ gallery.length }}
      </p>
      <span class="gallery-scan" aria-hidden="true" />
    </div>

    <ul class="gallery-thumbs" aria-label="Miniaturas">
      <li v-for="(image, imageIndex) in gallery" :key="image.src">
        <button
          type="button"
          :aria-label="`Ver foto ${imageIndex + 1}: ${image.alt}`"
          :aria-current="imageIndex === index ? 'true' : undefined"
          @click="select(imageIndex)"
        >
          <img :src="image.src" alt="" width="320" height="214" loading="lazy">
        </button>
      </li>
    </ul>
    <div class="gallery-progress" aria-hidden="true">
      <span :style="{ width: `${((index + 1) / gallery.length) * 100}%` }" />
    </div>
  </section>
</template>
