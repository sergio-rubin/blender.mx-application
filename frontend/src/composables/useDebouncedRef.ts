import { onBeforeUnmount, ref, watch, type Ref } from "vue";

export function useDebouncedRef(source: Ref<string>, delay = 350) {
  const debounced = ref(source.value);
  let timer: number | undefined;

  watch(source, (value) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      debounced.value = value;
    }, delay);
  });

  onBeforeUnmount(() => window.clearTimeout(timer));
  return debounced;
}
