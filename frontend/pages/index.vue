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
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.landing-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* Video Background */
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
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
  background: linear-gradient(
    135deg,
    rgba(255, 155, 133, 0.7) 0%,
    rgba(168, 230, 207, 0.6) 50%,
    rgba(136, 216, 247, 0.7) 100%
  );
  backdrop-filter: blur(2px);
}

/* Content Wrapper */
.content-wrapper {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.hero-content {
  max-width: 900px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 60px 50px;
  border-radius: 30px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  animation: fadeInUp 1s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  margin-bottom: 20px;
}

.paw-icon {
  font-size: 4rem;
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
  font-size: 5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #FF9B85 0%, #88D8F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.8rem;
  color: #5D4E37;
  font-weight: 600;
  margin-bottom: 20px;
  line-height: 1.4;
}

.hero-description {
  font-size: 1.2rem;
  color: #7A7265;
  margin-bottom: 40px;
  line-height: 1.8;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 60px;
}

.btn {
  padding: 18px 45px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.btn-primary {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  box-shadow: 0 15px 35px rgba(255, 155, 133, 0.4);
}

.btn-primary:hover {
  transform: translateY(-8px) scale(1.08);
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
  transform: translateY(-8px) scale(1.08);
  box-shadow: 0 15px 40px rgba(136, 216, 247, 0.5);
}

/* Features Section */
.features-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 20px;
}

.feature-item {
  background: linear-gradient(135deg, #FFF4E6 0%, #ffffff 100%);
  padding: 35px 25px;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  border: 2px solid transparent;
}

.feature-item:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 45px rgba(255, 155, 133, 0.25);
  border-color: #FF9B85;
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #FF9B85 0%, #88D8F7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(255, 155, 133, 0.3);
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon {
  transform: scale(1.15) rotate(10deg);
  box-shadow: 0 15px 40px rgba(255, 155, 133, 0.5);
}

.feature-icon i {
  font-size: 2.5rem;
  color: white;
}

.feature-item h3 {
  font-size: 1.3rem;
  color: #5D4E37;
  margin-bottom: 10px;
  font-weight: 700;
}

.feature-item p {
  color: #7A7265;
  font-size: 1rem;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    padding: 40px 30px;
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

  .cta-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .btn {
    width: 100%;
    padding: 16px 35px;
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feature-icon {
    width: 70px;
    height: 70px;
  }

  .feature-icon i {
    font-size: 2rem;
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