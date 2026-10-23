import "@fontsource/bodoni-moda/latin-600.css";
import "@fontsource/bodoni-moda/latin-700.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./styles.css";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { createHead } from "@unhead/vue/client";
import { createApp } from "vue";

import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).use(VueQueryPlugin).use(createHead()).mount("#app");
