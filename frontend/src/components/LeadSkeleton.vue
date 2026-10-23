<template>
  <div class="lead-skeleton" aria-hidden="true">
    <div v-for="row in 5" :key="row" class="skeleton-row">
      <span /><span /><span /><span />
    </div>
  </div>
</template>
