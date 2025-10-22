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
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                  <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z"/>
                </svg>
              </div>
              <h6 class="account-type-title">Individual</h6>
              <p class="account-type-description">For cat lovers, adopters, and community members</p>
            </div>

            <div class="account-type-card" @click="setFormType('organisation')">
              <div class="account-type-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                  <path d="M333.4 66.9C329.2 65 324.7 64 320 64C315.3 64 310.8 65 306.6 66.9L118.3 146.8C96.3 156.1 79.9 177.8 80 204C80.5 303.2 121.3 484.7 293.6 567.2C310.3 575.2 329.7 575.2 346.4 567.2C518.8 484.7 559.6 303.2 560 204C560.1 177.8 543.7 156.1 521.7 146.8L333.4 66.9zM224 218.4C224 212.6 228.7 208 234.4 208L234.6 208C238 208 241.1 209.6 243.1 212.3L283.1 265.6C286.1 269.6 290.9 272 295.9 272L343.9 272C348.9 272 353.7 269.6 356.7 265.6L396.7 212.3C398.7 209.6 401.9 208 405.2 208L405.4 208C411.2 208 415.8 212.7 415.8 218.4L416 336C416 389 373 432 320 432C267 432 224 389 224 336L224 218.4zM280 352C288.8 352 296 344.8 296 336C296 327.2 288.8 320 280 320C271.2 320 264 327.2 264 336C264 344.8 271.2 352 280 352zM376 336C376 327.2 368.8 320 360 320C351.2 320 344 327.2 344 336C344 344.8 351.2 352 360 352C368.8 352 376 344.8 376 336z"/>
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
