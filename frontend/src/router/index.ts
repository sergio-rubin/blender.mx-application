import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
    { path: "/interesados", name: "leads", component: () => import("@/views/LeadsView.vue") },
    { path: "/privacidad", name: "privacy", component: () => import("@/views/PrivacyView.vue") },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});
