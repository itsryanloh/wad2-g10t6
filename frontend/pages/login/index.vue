<template>
  <div class="forum-page d-flex flex-column">
    <div class="hero-section">
      <div class="wave-animation"></div>
    </div>
    <div class="d-flex align-items-center flex-grow-1">
      <LoginForm />
    </div>
  </div>
</template>

<script setup>
import LoginForm from "~/components/LoginForm.vue";
</script>

<style scoped>
.forum-page {
  height: 100%;
  min-height: 0;
  padding-bottom: 0;
}

.hero-section {
  box-shadow: unset;
}
</style>
