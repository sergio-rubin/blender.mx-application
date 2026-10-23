<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useHead } from "@unhead/vue";
import { LogOut, RefreshCw, Search, UsersRound } from "lucide-vue-next";
import { computed, ref } from "vue";

import LeadSkeleton from "@/components/LeadSkeleton.vue";
import LoginForm from "@/components/LoginForm.vue";
import UiButton from "@/components/UiButton.vue";
import { useDebouncedRef } from "@/composables/useDebouncedRef";
import { ApiError, api } from "@/lib/api";

useHead({
  title: "Interesados · NIDO / ZAPOPAN",
  meta: [{ name: "robots", content: "noindex,nofollow" }],
  link: [{ rel: "canonical", href: "https://blender-application.wacoding.org/interesados" }],
});

const queryClient = useQueryClient();
const search = ref("");
const debouncedSearch = useDebouncedRef(search, 350);

const session = useQuery({ queryKey: ["session"], queryFn: api.session, retry: false });
const authenticated = computed(() => session.data.value?.authenticated === true);
const leads = useQuery({
  queryKey: computed(() => ["leads", debouncedSearch.value.trim()]),
  queryFn: ({ signal }) => api.leads(debouncedSearch.value.trim(), signal),
  enabled: authenticated,
  retry: (count, error) => error instanceof ApiError && error.status === 0 && count < 1,
});

const logout = useMutation({
  mutationFn: api.logout,
  onSettled: async () => {
    queryClient.removeQueries({ queryKey: ["leads"] });
    await queryClient.invalidateQueries({ queryKey: ["session"] });
  },
});

async function loginSuccess() {
  await queryClient.invalidateQueries({ queryKey: ["session"] });
  await queryClient.invalidateQueries({ queryKey: ["leads"] });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
</script>

<template>
  <main id="main-content" class="leads-page">
    <LoginForm v-if="!session.isPending.value && !authenticated" @success="loginSuccess" />

    <section v-else class="leads-workspace" aria-labelledby="leads-title">
      <div class="leads-heading">
        <div>
          <h1 id="leads-title">
            Interesados
          </h1>
          <p>Personas que solicitaron información sobre este departamento.</p>
        </div>
        <div v-if="authenticated" class="session-actions">
          <UiButton variant="outline" :loading="leads.isFetching.value" loading-label="Actualizando…" @click="leads.refetch()">
            <RefreshCw :size="17" aria-hidden="true" /> Actualizar
          </UiButton>
          <UiButton variant="ghost" :loading="logout.isPending.value" loading-label="Saliendo…" @click="logout.mutate()">
            <LogOut :size="17" aria-hidden="true" /> Salir
          </UiButton>
        </div>
      </div>

      <div v-if="authenticated" class="lead-search">
        <label for="lead-search">Buscar por nombre</label>
        <div class="input-wrap">
          <Search :size="18" aria-hidden="true" />
          <input id="lead-search" v-model="search" type="search" placeholder="Buscar por nombre">
        </div>
      </div>

      <div v-if="session.isPending.value || (authenticated && leads.isPending.value)" class="leads-table-state" aria-busy="true">
        <p class="sr-only" role="status">
          Cargando interesados…
        </p>
        <LeadSkeleton />
      </div>

      <div v-else-if="authenticated && leads.isError.value" class="empty-state" role="alert">
        <p>{{ leads.error.value instanceof ApiError ? leads.error.value.message : "No pudimos cargar los interesados." }}</p>
        <UiButton variant="outline" @click="leads.refetch()">
          Reintentar
        </UiButton>
      </div>

      <div v-else-if="authenticated && leads.data.value?.results.length === 0" class="empty-state">
        <UsersRound :size="34" :stroke-width="1.3" aria-hidden="true" />
        <p>{{ debouncedSearch.trim() ? `Sin resultados para “${debouncedSearch.trim()}”` : "Aún no hay interesados" }}</p>
      </div>

      <div v-else-if="authenticated" class="lead-table" role="table" aria-label="Interesados, del más reciente al más antiguo">
        <div class="lead-row lead-header" role="row">
          <span role="columnheader">Nombre</span><span role="columnheader">Teléfono</span><span role="columnheader">Correo</span><span role="columnheader">Fecha ↓</span>
        </div>
        <div v-for="(lead, leadIndex) in leads.data.value?.results" :key="lead.id" class="lead-row" role="row">
          <i class="lead-dot" :class="{ 'is-recent': leadIndex === 0 }" aria-hidden="true" />
          <strong role="cell">{{ lead.name }}</strong>
          <a role="cell" :href="`tel:${lead.phone}`">{{ lead.phone }}</a>
          <a role="cell" :href="`mailto:${lead.email}`">{{ lead.email }}</a>
          <time role="cell" :datetime="lead.created_at">{{ formatDate(lead.created_at) }}</time>
        </div>
      </div>
    </section>
  </main>
</template>
