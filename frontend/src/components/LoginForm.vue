<script setup lang="ts">
import { LockKeyhole, UserRound } from "lucide-vue-next";
import { reactive, ref } from "vue";
import { useWebHaptics } from "web-haptics/vue";

import { ApiError, api } from "@/lib/api";
import UiButton from "./UiButton.vue";

const emit = defineEmits<{ success: [] }>();
const haptic = useWebHaptics();
const values = reactive({ username: "", password: "" });
const loading = ref(false);
const error = ref("");

async function login() {
  error.value = "";
  if (!values.username || !values.password) {
    error.value = "Escribe tu usuario y contraseña.";
    haptic.trigger("error");
    return;
  }
  loading.value = true;
  try {
    await api.login(values.username, values.password);
    haptic.trigger("success");
    emit("success");
  } catch (caught) {
    haptic.trigger("error");
    error.value = caught instanceof ApiError ? caught.message : "No pudimos iniciar sesión.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="login-panel" aria-labelledby="login-title">
    <div class="login-photo" aria-hidden="true" />
    <div class="login-content">
      <h1 id="login-title">
        Acceso de<br>personal
      </h1>
      <p>Ingresa con tu cuenta autorizada para consultar los registros.</p>
      <form novalidate @submit.prevent="login">
        <div class="form-field">
          <label for="login-user">Usuario</label>
          <div class="input-wrap">
            <UserRound :size="18" aria-hidden="true" />
            <input id="login-user" v-model="values.username" autocomplete="username">
          </div>
        </div>
        <div class="form-field">
          <label for="login-password">Contraseña</label>
          <div class="input-wrap">
            <LockKeyhole :size="18" aria-hidden="true" />
            <input id="login-password" v-model="values.password" type="password" autocomplete="current-password">
          </div>
        </div>
        <p v-if="error" class="form-error" role="alert">
          {{ error }}
        </p>
        <UiButton type="submit" :loading="loading" loading-label="Entrando…">
          Entrar
        </UiButton>
      </form>
    </div>
  </section>
</template>
