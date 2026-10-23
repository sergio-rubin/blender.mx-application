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
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useWebHaptics } from "web-haptics/vue";

import InterestForm from "./InterestForm.vue";
import UiButton from "./UiButton.vue";

defineProps<{ compact?: boolean }>();
const open = ref(false);
const haptic = useWebHaptics();
const dragOffset = ref(0);
const dragging = ref(false);
const snapping = ref(false);

let startY = 0;
let lastY = 0;
let lastTime = 0;
let velocity = 0;
let resetTimer = 0;
let activePointerId = -1;

const sheetStyle = computed(() => {
  if (!dragging.value && !snapping.value) return undefined;
  return { transform: `translateY(${dragOffset.value}px)` };
});

function openSheet() {
  haptic.trigger("medium");
  open.value = true;
}

function canDragSheet() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function startDrag(event: PointerEvent) {
  if (!canDragSheet() || event.button !== 0) return;
  window.clearTimeout(resetTimer);
  startY = event.clientY;
  lastY = event.clientY;
  lastTime = performance.now();
  velocity = 0;
  activePointerId = event.pointerId;
  dragging.value = true;
  snapping.value = false;
  window.addEventListener("pointermove", moveDrag, { passive: false });
  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", cancelDrag);
}

function moveDrag(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== activePointerId) return;
  event.preventDefault();
  const now = performance.now();
  const elapsed = Math.max(now - lastTime, 1);
  velocity = (event.clientY - lastY) / elapsed;
  lastY = event.clientY;
  lastTime = now;
  dragOffset.value = Math.max(0, event.clientY - startY);
}

function removeDragListeners() {
  window.removeEventListener("pointermove", moveDrag);
  window.removeEventListener("pointerup", finishDrag);
  window.removeEventListener("pointercancel", cancelDrag);
  activePointerId = -1;
}

function resetDragState() {
  dragOffset.value = 0;
  dragging.value = false;
  snapping.value = false;
}

function finishDrag(event: PointerEvent) {
  if (!dragging.value || event.pointerId !== activePointerId) return;
  removeDragListeners();

  dragging.value = false;
  snapping.value = true;
  const shouldClose = dragOffset.value > 92 || (dragOffset.value > 32 && velocity > 0.55);

  if (shouldClose) {
    haptic.trigger("light");
    dragOffset.value = window.innerHeight;
    resetTimer = window.setTimeout(() => {
      open.value = false;
      resetTimer = window.setTimeout(resetDragState, 280);
    }, 210);
    return;
  }

  dragOffset.value = 0;
  resetTimer = window.setTimeout(() => {
    snapping.value = false;
  }, 260);
}

function cancelDrag(event: PointerEvent) {
  velocity = 0;
  finishDrag(event);
}

watch(open, (isOpen) => {
  if (isOpen) return;
  removeDragListeners();
  if (snapping.value) return;
  window.clearTimeout(resetTimer);
  resetDragState();
});

onBeforeUnmount(() => {
  removeDragListeners();
  window.clearTimeout(resetTimer);
});
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
      <DialogContent
        class="interest-sheet"
        :class="{ 'is-dragging': dragging, 'is-snapping': snapping }"
        :style="sheetStyle"
      >
        <button
          type="button"
          class="sheet-handle"
          aria-label="Desliza hacia abajo para cerrar"
          @pointerdown="startDrag"
        >
          <span aria-hidden="true" />
        </button>
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
