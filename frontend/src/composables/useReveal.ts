import { onMounted, onBeforeUnmount, type Ref } from "vue";

export function useReveal(root: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | undefined;
  onMounted(() => {
    const elements = root.value?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("is-revealed"));
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-revealed");
            observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    elements.forEach((element) => observer?.observe(element));
  });
  onBeforeUnmount(() => observer?.disconnect());
}
