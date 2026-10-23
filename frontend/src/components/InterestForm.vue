<script setup lang="ts">
import { Check, CheckCircle2, Mail, Phone, UserRound } from "lucide-vue-next";
import { reactive, ref } from "vue";
import { useWebHaptics } from "web-haptics/vue";
import { z } from "zod";

import { ApiError, api } from "@/lib/api";
import UiButton from "./UiButton.vue";

const emit = defineEmits<{ close: [] }>();
const haptic = useWebHaptics();
const isSubmitting = ref(false);
const success = ref(false);
const requestError = ref("");
const values = reactive({ name: "", phone: "", email: "", privacy_consent: false, website: "" });
const errors = reactive<Record<string, string>>({});

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo."),
  phone: z.string().trim().refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 10 && digits <= 15;
  }, "Escribe un teléfono válido."),
  email: z.email("Escribe un correo válido."),
  privacy_consent: z.boolean().refine(Boolean, "Debes aceptar el aviso de privacidad."),
  website: z.string(),
});

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  requestError.value = "";
}

async function submit() {
  clearErrors();
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!errors[field]) errors[field] = issue.message;
    }
    haptic.trigger("error");
    document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    return;
  }

  isSubmitting.value = true;
  try {
    await api.createLead({ ...parsed.data, privacy_consent: true });
    success.value = true;
    haptic.trigger("success");
  } catch (error) {
    haptic.trigger("error");
    if (error instanceof ApiError && error.fieldErrors) {
      for (const [field, messages] of Object.entries(error.fieldErrors)) {
        errors[field] = messages[0] ?? "Revisa este campo.";
      }
    }
    requestError.value = error instanceof ApiError ? error.message : "No pudimos enviar tus datos.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Transition name="form-state" mode="out-in">
    <div v-if="success" class="interest-success" role="status">
      <span class="success-icon"><CheckCircle2 :size="48" :stroke-width="1.35" /></span>
      <h2>Gracias,<br>te contactaremos pronto.</h2>
      <p>Recibimos tus datos. Uno de nuestros asesores se pondrá en contacto contigo a la brevedad.</p>
      <UiButton @click="emit('close')">
        Cerrar
      </UiButton>
    </div>

    <form v-else class="interest-form" novalidate @submit.prevent="submit">
      <div class="form-field">
        <label for="lead-name">Nombre</label>
        <div class="input-wrap">
          <UserRound :size="18" :stroke-width="1.5" aria-hidden="true" />
          <input id="lead-name" v-model="values.name" autocomplete="name" placeholder="Tu nombre completo" :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? 'lead-name-error' : undefined">
        </div>
        <p v-if="errors.name" id="lead-name-error" class="field-error">
          {{ errors.name }}
        </p>
      </div>

      <div class="form-field">
        <label for="lead-phone">Teléfono</label>
        <div class="input-wrap">
          <Phone :size="18" :stroke-width="1.5" aria-hidden="true" />
          <input id="lead-phone" v-model="values.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Ej. 33 1234 5678" :aria-invalid="Boolean(errors.phone)" :aria-describedby="errors.phone ? 'lead-phone-error' : undefined">
        </div>
        <p v-if="errors.phone" id="lead-phone-error" class="field-error">
          {{ errors.phone }}
        </p>
      </div>

      <div class="form-field">
        <label for="lead-email">Correo electrónico</label>
        <div class="input-wrap">
          <Mail :size="18" :stroke-width="1.5" aria-hidden="true" />
          <input id="lead-email" v-model="values.email" type="email" inputmode="email" autocomplete="email" placeholder="tucorreo@ejemplo.com" :aria-invalid="Boolean(errors.email)" :aria-describedby="errors.email ? 'lead-email-error' : undefined">
        </div>
        <p v-if="errors.email" id="lead-email-error" class="field-error">
          {{ errors.email }}
        </p>
      </div>

      <div class="honeypot" aria-hidden="true">
        <label for="lead-website">Sitio web</label>
        <input id="lead-website" v-model="values.website" tabindex="-1" autocomplete="off">
      </div>

      <div class="consent-field">
        <label class="consent-row" for="lead-consent">
          <input id="lead-consent" v-model="values.privacy_consent" type="checkbox" :aria-invalid="Boolean(errors.privacy_consent)" :aria-describedby="errors.privacy_consent ? 'lead-consent-error' : undefined">
          <span class="checkbox-box"><Check :size="15" aria-hidden="true" /></span>
          <span>Acepto el <RouterLink to="/privacidad" target="_blank">aviso de privacidad</RouterLink>.</span>
        </label>
        <p v-if="errors.privacy_consent" id="lead-consent-error" class="field-error">
          {{ errors.privacy_consent }}
        </p>
      </div>

      <p v-if="requestError" class="form-error" role="alert">
        {{ requestError }}
      </p>
      <UiButton type="submit" :loading="isSubmitting" loading-label="Enviando…">
        Enviar mis datos <span aria-hidden="true">→</span>
      </UiButton>
    </form>
  </Transition>
</template>
