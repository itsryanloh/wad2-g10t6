<template>
  <div class="landing-page">
    <!-- Video Background -->
    <div class="video-background">
      <video 
        autoplay 
        loop 
        muted 
        playsinline
        class="background-video"
      >
        <source src="/cat-running.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="video-overlay"></div>
    </div>

    <!-- Content Overlay -->
    <div class="content-wrapper">
      <div class="hero-content">
        <div class="logo-section">
          <i class="fas fa-paw paw-icon"></i>
          <h1 class="hero-title">Adore</h1>
        </div>
        
        <p class="hero-subtitle">
          Connecting Cats with Loving Homes in Singapore
        </p>
        
        <p class="hero-description">
          Join our community to help stray cats find their forever homes. 
          Share sightings, coordinate adoptions, and make a difference.
        </p>
        
        <div class="cta-buttons">
          <button class="btn btn-primary" @click="navigateTo('/forum/main')">
            <i class="fas fa-comments me-2"></i>
            Explore Forum
          </button>
          <button class="btn btn-secondary" @click="navigateTo('/forum/createPost')">
            <i class="fas fa-plus me-2"></i>
            Share Sighting
          </button>
        </div>

        <!-- Features Inside Hero Content -->
        <div class="features-section">
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-heart"></i>
            </div>
            <h3>Adoptions</h3>
            <p>Help cats find homes</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <h3>Track Sightings</h3>
            <p>Report cat locations</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-users"></i>
            </div>
            <h3>Community</h3>
            <p>Connect with helpers</p>
          </div>
        </div>
      </div>
    </div>
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '~/components/LoginForm.vue';
definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.landing-page {
  position: relative;
  min-height: 100vh; /* Full viewport height */
  overflow: hidden;
}

/* Video Background */
.video-background {
  position: absolute; /* Changed from fixed to absolute */
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% + 200px); /* Extend beyond container to cover gap */
  z-index: 0;
  pointer-events: none; /* Prevent blocking clicks */
}

.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Overlay for readability */
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

/* Content Wrapper - Flush to left with NO gap */
.content-wrapper {
  position: relative;
  z-index: 10;
  min-height: 100vh; /* Full viewport height */
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0; /* Remove all padding */
}

.hero-content {
  max-width: 500px;
  text-align: left;
  background: rgba(255, 255, 255, 0.65);
  padding: 50px 40px;
  border-radius: 0 30px 30px 0; /* Rounded only on right side */
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  animation: slideInLeft 1s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-left: none; /* Remove left border since it's flush */
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.paw-icon {
  font-size: 3.5rem;
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-12deg); }
  75% { transform: rotate(12deg); }
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #FF9B85 0%, #88D8F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #5D4E37;
  font-weight: 600;
  margin-bottom: 15px;
  line-height: 1.4;
}

.hero-description {
  font-size: 1.1rem;
  color: #7A7265;
  margin-bottom: 30px;
  line-height: 1.6;
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-bottom: 35px;
}

.btn {
  padding: 15px 35px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.btn-primary {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  box-shadow: 0 15px 35px rgba(255, 155, 133, 0.4);
}

.btn-primary:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 20px 50px rgba(255, 155, 133, 0.6);
}

.btn-secondary {
  background: white;
  color: #FF9B85;
  border: 3px solid #FF9B85;
  box-shadow: 0 10px 30px rgba(255, 155, 133, 0.2);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #88D8F7 0%, #A8E6CF 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 40px rgba(136, 216, 247, 0.5);
}

/* Features Section - Now Inside Hero Content */
.features-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-top: 10px;
}

.feature-item {
  background: linear-gradient(135deg, #FFF4E6 0%, #ffffff 100%);
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 15px;
}

.feature-item:hover {
  transform: translateX(10px);
  box-shadow: 0 10px 25px rgba(255, 155, 133, 0.2);
  border-color: #FF9B85;
}

.feature-icon {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #FF9B85 0%, #88D8F7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(255, 155, 133, 0.3);
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon {
  transform: scale(1.1) rotate(10deg);
  box-shadow: 0 12px 30px rgba(255, 155, 133, 0.4);
}

.feature-icon i {
  font-size: 1.8rem;
  color: white;
}

.feature-item h3 {
  font-size: 1.1rem;
  color: #5D4E37;
  margin-bottom: 3px;
  font-weight: 700;
}

.feature-item p {
  color: #7A7265;
  font-size: 0.9rem;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-wrapper {
    justify-content: center;
    padding: 60px 20px;
  }
  
  .hero-content {
    text-align: center;
    max-width: 100%;
    border-radius: 30px;
    border-left: 2px solid rgba(255, 255, 255, 0.8);
  }

  .logo-section {
    justify-content: center;
  }
  
  .cta-buttons {
    justify-content: center;
  }

  .hero-title {
    font-size: 3rem;
  }

  .paw-icon {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.3rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .btn {
    width: 100%;
    padding: 16px 35px;
  }

  .feature-item {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .logo-section {
    flex-direction: column;
    gap: 15px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-content {
    padding: 30px 20px;
  }
}
</style>
