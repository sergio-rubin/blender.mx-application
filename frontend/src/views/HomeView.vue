<script setup lang="ts">
import { MapPin } from "lucide-vue-next";
import { gsap } from "gsap";
import { onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";

import FeatureRail from "@/components/FeatureRail.vue";
import InterestSheet from "@/components/InterestSheet.vue";
import PropertyGallery from "@/components/PropertyGallery.vue";
import { useReveal } from "@/composables/useReveal";
import { property } from "@/data/property";

const page = ref<HTMLElement | null>(null);
useReveal(page);

useHead({
  title: "Departamento en Zapopan · $3,450,000 MXN",
  meta: [
    { name: "description", content: "Departamento en Zapopan, Jalisco: 2 recámaras, 2 baños, 95 m², estacionamiento, alberca y gimnasio." },
    { name: "robots", content: "index,follow,max-image-preview:large" },
  ],
  link: [{ rel: "canonical", href: "https://blender-application.wacoding.org/" }],
});

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  timeline
    .from(".gallery-stage", { clipPath: "inset(0 100% 0 0)", duration: 0.7 })
    .from(".gallery-scan", { scaleX: 0, transformOrigin: "left", duration: 0.45 }, "<0.06")
    .from(".property-panel > *", { y: 14, opacity: 0, stagger: 0.045, duration: 0.38 }, "<0.14")
    .from(".feature-rail", { opacity: 0, duration: 0.3 }, "<");
});
</script>

<template>
  <main id="main-content" ref="page" class="home-page">
    <section class="property-hero" aria-labelledby="property-title">
      <PropertyGallery />
      <div class="property-panel">
        <h1 id="property-title">
          Departamento<br>en Zapopan
        </h1>
        <p class="property-price">
          {{ property.price }}
        </p>
        <p class="property-location">
          <MapPin :size="22" :stroke-width="1.5" aria-hidden="true" />{{ property.location }}
        </p>
        <InterestSheet />
        <FeatureRail />
      </div>
    </section>

    <section class="amenities" aria-labelledby="amenities-title">
      <div class="amenities-image" data-reveal>
        <img src="/images/apartment-amenities.webp" alt="Alberca del desarrollo con áreas verdes" width="1400" height="900" loading="lazy">
      </div>
      <div class="amenities-copy" data-reveal>
        <span class="measure-label">AMENIDADES</span>
        <h2 id="amenities-title">
          Vivir bien,<br>sin salir de casa
        </h2>
        <p>Alberca y gimnasio para tu día a día, en un entorno contemporáneo y bien conectado con Zapopan.</p>
        <div class="copper-rule" aria-hidden="true" />
      </div>
      <div class="location-note" data-reveal>
        <MapPin :size="22" :stroke-width="1.45" aria-hidden="true" />
        <div><strong>Zapopan, Jalisco</strong><span>Solicita la ubicación exacta y agenda una visita.</span></div>
        <InterestSheet compact />
      </div>
    </section>

    <footer class="site-footer">
      <span>Zapopan · Jalisco · México</span>
      <RouterLink to="/privacidad">
        Aviso de privacidad
      </RouterLink>
    </footer>

    <div class="mobile-cta">
      <span>{{ property.price }}</span>
      <InterestSheet compact />
    </div>
  </main>
</template>
