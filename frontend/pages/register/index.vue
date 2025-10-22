<template>
  <div class="forum-page d-flex flex-column flex-grow-1">
    <div class="hero-section position-absolute w-100">
      <div class="wave-animation"></div>
    </div>
    <div class="align-items-center flex-grow-1 d-flex">
      <div v-if="!formType" class="card mx-auto" style="width: 32rem">
        <div class="card-body">
          <h5 class="card-title text-center mb-4">Create an Account</h5>
          <p class="text-center text-muted mb-4">Choose your account type</p>

          <div class="account-type-container">
            <div class="account-type-card" @click="setFormType('individual')">
              <div class="account-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                </svg>
              </div>
              <h6 class="account-type-title">Individual</h6>
              <p class="account-type-description">For cat lovers, adopters, and community members</p>
            </div>

            <div class="account-type-card" @click="setFormType('organisation')">
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
      <IndividualRegistration v-else-if="formType === 'individual'" @set-form-type="setFormType"/>
      <OrganisationRegistration  v-else-if="formType === 'organisation'" @set-form-type="setFormType"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import IndividualRegistration from  "~/components/IndividualRegistration.vue";
import OrganisationRegistration from  "~/components/OrganisationRegistration.vue";

const formType = ref("")
const setFormType = (type: string) => {
  formType.value = type;
};

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

.card {
  background: rgba(255, 255, 255, 0.40);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(7.7px);
  -webkit-backdrop-filter: blur(7.7px);
  border: 1px solid rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.30);
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
