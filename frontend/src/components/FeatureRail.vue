<script setup lang="ts">
import { features } from "@/data/property";
</script>

<template>
  <ul class="feature-rail" aria-label="Características del departamento">
    <li v-for="({ icon, label }, featureIndex) in features" :key="label">
      <span class="rail-dot" :class="{ 'is-active': featureIndex === 0 }" aria-hidden="true" />
      <component :is="icon" :size="21" :stroke-width="1.55" aria-hidden="true" />
      <span>{{ label }}</span>
    </li>
  </ul>
</template>
