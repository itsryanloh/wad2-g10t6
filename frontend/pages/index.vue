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
        <source src="https://lcphtbqstutbhgxbcfpo.supabase.co/storage/v1/object/public/postImages/videos/cat-running-highres.mp4" type="video/mp4">
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
            <div>
              <h3>Adoptions</h3>
              <p>Help cats find homes</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div>
              <h3>Track Sightings</h3>
              <p>Report cat locations</p>
            </div>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <i class="fas fa-users"></i>
            </div>
            <div>
              <h3>Community</h3>
              <p>Connect with helpers</p>
            </div>
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

<style>
/* Global override - make content fit between navbar and footer with NO GAPS */
.main-content {
  min-height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  display: block !important;
}

/* Ensure app-layout has no gaps */
.app-layout {
  display: flex !important;
  flex-direction: column !important;
  min-height: 100vh !important;
}

.app-layout > .main-content {
  flex: 1 !important;
}
</style>

<style scoped>
.landing-page {
  position: relative;
  min-height: 600px; /* Set a minimum height instead of auto */
  height: auto; /* Allow content to define height */
  overflow: visible; /* Changed from hidden */
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  display: block; /* Changed from flex to block */
}

/* Video Background */
.video-background {
  position: absolute; /* Changed back to absolute */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* Match parent height */
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
  backdrop-filter: blur(2px);
}

/* Content Styling */
.content-wrapper {
  position: relative;
  z-index: 1;
  min-height: 600px; /* Set minimum height */
  height: auto; /* Allow natural height */
  display: flex;
  align-items: center;
  padding: 0; /* Remove all padding */
  margin: 0;
}

.hero-content {
  max-width: 500px; /* Reduced from 650px */
  background: rgba(255, 255, 255, 0.95);
  padding: 35px 30px; /* Further reduced padding */
  border-radius: 0 35px 35px 0;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-left: none;
  animation: fadeInLeft 1s ease;
  margin: 0; /* Ensure no margin */
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Logo and Title */
.logo-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.paw-icon {
  font-size: 4rem;
  background: linear-gradient(135deg, #FF9B85 0%, #88D8F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
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

/* Features Section - NO HOVER EFFECTS */
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
  /* REMOVED: transition, border */
  display: flex;
  align-items: center;
  gap: 15px;
}

/* REMOVED ALL HOVER EFFECTS */
/* .feature-item:hover { ... } */

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
  /* REMOVED: transition */
}

/* REMOVED HOVER ON ICON */
/* .feature-item:hover .feature-icon { ... } */

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