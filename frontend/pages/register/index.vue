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
                  <path d="M298.5 156.9C312.8 199.8 298.2 243.1 265.9 253.7C233.6 264.3 195.8 238.1 181.5 195.2C167.2 152.3 181.8 109 214.1 98.4C246.4 87.8 284.2 114 298.5 156.9zM164.4 262.6C183.3 295 178.7 332.7 154.2 346.7C129.7 360.7 94.5 345.8 75.7 313.4C56.9 281 61.4 243.3 85.9 229.3C110.4 215.3 145.6 230.2 164.4 262.6zM133.2 465.2C185.6 323.9 278.7 288 320 288C361.3 288 454.4 323.9 506.8 465.2C510.4 474.9 512 485.3 512 495.7L512 497.3C512 523.1 491.1 544 465.3 544C453.8 544 442.4 542.6 431.3 539.8L343.3 517.8C328 514 312 514 296.7 517.8L208.7 539.8C197.6 542.6 186.2 544 174.7 544C148.9 544 128 523.1 128 497.3L128 495.7C128 485.3 129.6 474.9 133.2 465.2zM485.8 346.7C461.3 332.7 456.7 295 475.6 262.6C494.5 230.2 529.6 215.3 554.1 229.3C578.6 243.3 583.2 281 564.3 313.4C545.4 345.8 510.3 360.7 485.8 346.7zM374.1 253.7C341.8 243.1 327.2 199.8 341.5 156.9C355.8 114 393.6 87.8 425.9 98.4C458.2 109 472.8 152.3 458.5 195.2C444.2 238.1 406.4 264.3 374.1 253.7z"/>
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
