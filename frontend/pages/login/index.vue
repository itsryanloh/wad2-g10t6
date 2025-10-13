<template>
  <div>
    <div class="video-background">
      <video autoplay loop muted playsinline class="background-video">
        <source src="/cat-running.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div class="video-overlay"></div>
    </div>
    <div class="flex">
      <LoginForm />
    </div>
  </div>
</template>

<script setup>
import LoginForm from "~/components/LoginForm.vue";
</script>

<style scoped>
.video-background {
  position: absolute;
  /* Changed from fixed to absolute */
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% + 200px);
  /* Extend beyond container to cover gap */
  z-index: 0;
  pointer-events: none;
  /* Prevent blocking clicks */
}
.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: none;
}
</style>
