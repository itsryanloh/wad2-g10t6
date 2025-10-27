<template>
  <div class="forum-page d-flex flex-column flex-grow-1">
    <div class="hero-section position-absolute w-100">
      <div class="wave-animation"></div>
    </div>
    <div class="align-items-center flex-grow-1 d-flex">
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
  min-height: fit-content;
  padding-bottom: 0;
}

.hero-section {
  box-shadow: unset;
}
</style>
