<script setup lang="ts">
import UiSpinner from "./UiSpinner.vue";

withDefaults(
  defineProps<{
    type?: "button" | "submit";
    variant?: "primary" | "outline" | "ghost";
    loading?: boolean;
    loadingLabel?: string;
    disabled?: boolean;
  }>(),
  { type: "button", variant: "primary", loading: false, loadingLabel: "Cargando…", disabled: false },
);
</script>

<template>
  <button
    :type="type"
    class="ui-button"
    :class="`is-${variant}`"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span class="button-content" :class="{ 'is-hidden': loading }" :aria-hidden="loading"><slot /></span>
    <span v-if="loading" class="button-loading"><UiSpinner />{{ loadingLabel }}</span>
  </button>
</template>
