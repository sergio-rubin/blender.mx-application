<script setup lang="ts">
import { useHead } from "@unhead/vue";

useHead({
  title: "Aviso de privacidad · NIDO / ZAPOPAN",
  meta: [{ name: "robots", content: "index,follow" }],
  link: [{ rel: "canonical", href: "https://blender-application.wacoding.org/privacidad" }],
});
</script>

<template>
  <main id="main-content" class="legal-page">
    <RouterLink to="/" class="back-link">
      ← Volver a la propiedad
    </RouterLink>
    <article>
      <h1>Aviso de privacidad</h1>
      <p class="legal-updated">
        Última actualización: 22 de octubre de 2026
      </p>
      <p>Los datos solicitados en este sitio —nombre, teléfono y correo electrónico— se utilizan exclusivamente para atender tu solicitud de información sobre el departamento presentado.</p>
      <h2>Datos y finalidad</h2>
      <p>La información se almacena en infraestructura administrada por el responsable del sitio y se limita al seguimiento comercial relacionado con esta propiedad. No se solicitan datos sensibles.</p>
      <h2>Conservación y acceso</h2>
      <p>El acceso a la lista de interesados está restringido a personal autorizado. Los datos se conservarán únicamente durante el tiempo necesario para dar seguimiento a la solicitud y cumplir obligaciones aplicables.</p>
      <h2>Tus derechos</h2>
      <p>Puedes solicitar acceso, rectificación, cancelación u oposición usando el mismo canal por el que un asesor se comunique contigo. Antes de entregar la demo pública se debe agregar aquí el medio de contacto definitivo del responsable.</p>
    </article>
  </main>
</template>
