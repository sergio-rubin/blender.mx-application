<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();
const isLeads = computed(() => route.name === "leads");
</script>

<template>
  <header class="site-header">
    <RouterLink class="wordmark" to="/" aria-label="NIDO Zapopan, inicio">
      <span>NIDO</span><i aria-hidden="true">/</i><small>ZAPOPAN</small>
    </RouterLink>
    <RouterLink class="header-link" :to="isLeads ? '/' : '/interesados'">
      {{ isLeads ? "Ver propiedad" : "Interesados" }}
    </RouterLink>
  </header>
</template>
