<template>
  <div>
    <div class="video-background">
      <video autoplay loop muted playsinline class="background-video">
        <source src="https://lcphtbqstutbhgxbcfpo.supabase.co/storage/v1/object/public/postImages/videos/cat-running-highres.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div class="video-overlay"></div>
    </div>
    <div class="flex">
      <div class="card mx-auto" style="width: 32rem">
        <div class="card-body">
          <h5 class="card-title text-center mb-4">Create an Account</h5>
          <p class="text-center text-muted mb-4">Choose your account type</p>

          <div class="account-type-container">
            <div class="account-type-card" @click="navigateToIndividual">
              <div class="account-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                </svg>
              </div>
              <h6 class="account-type-title">Individual</h6>
              <p class="account-type-description">For cat lovers, adopters, and community members</p>
            </div>

            <div class="account-type-card" @click="navigateToOrganisation">
              <div class="account-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                </svg>
              </div>
              <h6 class="account-type-title">Organisation</h6>
              <p class="account-type-description">For shelters, rescues, and animal welfare groups</p>
            </div>
          </div>

          <div class="text-center mt-4">
            <span class="text-muted">Already have an account? </span>
            <NuxtLink to="/login" class="link-primary">Login here</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const navigateToIndividual = () => {
  navigateTo('/register/individual');
};

const navigateToOrganisation = () => {
  navigateTo('/register/organisation');
};
</script>

<style scoped>
.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% + 200px);
  z-index: 0;
  pointer-events: none;
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

.account-type-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.account-type-card {
  padding: 2rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.account-type-card:hover {
  border-color: #ff9800;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.2);
}

.account-type-icon {
  color: #ff9800;
  margin-bottom: 1rem;
}

.account-type-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #212529;
}

.account-type-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0;
  line-height: 1.4;
}

.link-primary {
  color: #ff9800;
  text-decoration: none;
  font-weight: 500;
}

.link-primary:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .account-type-container {
    grid-template-columns: 1fr;
  }
}
</style>
