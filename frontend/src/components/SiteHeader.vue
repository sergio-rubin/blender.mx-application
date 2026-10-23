<script setup lang="ts">
import { ArrowUpRight } from "lucide-vue-next";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
const isLeads = computed(() => route.name === "leads");
const isScrolled = ref(false);
const scrollProgress = ref(0);

let frame = 0;

function updateHeader() {
  frame = 0;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  isScrolled.value = window.scrollY > 10;
  scrollProgress.value = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
}

function handleScroll() {
  if (!frame) frame = window.requestAnimationFrame(updateHeader);
}

onMounted(() => {
  updateHeader();
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  if (frame) window.cancelAnimationFrame(frame);
});
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': isScrolled }">
    <div class="header-inner">
      <RouterLink class="wordmark" to="/" aria-label="NIDO Zapopan, inicio">
        <img src="/icons/icon-192.png" alt="" width="34" height="34">
        <span class="wordmark-copy">
          <strong>NIDO</strong>
          <small>Zapopan · Jal.</small>
        </span>
      </RouterLink>

      <nav class="header-nav" aria-label="Navegación principal">
        <span class="header-context" aria-hidden="true">EXPEDIENTE · 01</span>
        <RouterLink class="header-link" :to="isLeads ? '/' : '/interesados'">
          <span class="header-link-dot" aria-hidden="true" />
          <span>{{ isLeads ? "Ver propiedad" : "Interesados" }}</span>
          <ArrowUpRight :size="16" :stroke-width="1.7" aria-hidden="true" />
        </RouterLink>
      </nav>
    </div>
    <span class="header-progress" aria-hidden="true">
      <i :style="{ transform: `scaleX(${scrollProgress})` }" />
    </span>
  </header>
</template>
