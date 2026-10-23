<script setup lang="ts">
import { RouterView } from "vue-router";

import SiteHeader from "@/components/SiteHeader.vue";
</script>

<template>
  <a class="skip-link" href="#main-content">Ir al contenido</a>
  <SiteHeader />
  <RouterView v-slot="{ Component, route }">
    <Transition name="route" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>
