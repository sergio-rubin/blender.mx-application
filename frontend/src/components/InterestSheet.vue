<script setup lang="ts">
import { X } from "lucide-vue-next";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";
import { ref } from "vue";
import { useWebHaptics } from "web-haptics/vue";

import InterestForm from "./InterestForm.vue";
import UiButton from "./UiButton.vue";

defineProps<{ compact?: boolean }>();
const open = ref(false);
const haptic = useWebHaptics();

function openSheet() {
  haptic.trigger("medium");
  open.value = true;
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <UiButton :class="{ 'is-compact': compact }" @click="openSheet">
        Me interesa <span aria-hidden="true">→</span>
      </UiButton>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="interest-sheet">
        <span class="sheet-handle" aria-hidden="true" />
        <DialogClose class="sheet-close" aria-label="Cerrar formulario">
          <X :size="24" :stroke-width="1.4" aria-hidden="true" />
        </DialogClose>
        <div class="sheet-measure" aria-hidden="true">
          <span>3.20 m</span>
        </div>
        <DialogTitle>Me interesa</DialogTitle>
        <DialogDescription>
          Déjanos tus datos y te contactaremos pronto.
        </DialogDescription>
        <InterestForm @close="open = false" />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
