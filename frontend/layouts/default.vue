<template>
  <div class="app-layout">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-custom sticky-top">
      <div class="container-fluid px-4">
        <!-- Logo & Brand -->
        <NuxtLink to="/" class="navbar-brand d-flex align-items-center">
          <div class="logo-container">
            <i class="fas fa-paw"></i>
          </div>
          <span class="brand-text ms-3">Adore</span>
        </NuxtLink>

        <!-- Mobile Toggle -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Nav Items -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <NuxtLink to="/" class="nav-link" active-class="active">
                <i class="fas fa-home me-2"></i>Home
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/forum" class="nav-link" active-class="active">
                <i class="fas fa-comments me-2"></i>Forum
              </NuxtLink>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link disabled">
                <i class="fas fa-map-marked-alt me-2"></i>Map
                <span class="badge bg-secondary ms-1">Soon</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link disabled">
                <i class="fas fa-list-check me-2"></i>Checklist
                <span class="badge bg-secondary ms-1">Soon</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link disabled">
                <i class="fas fa-user me-2"></i>Profile
                <span class="badge bg-secondary ms-1">Soon</span>
              </a>
            </li>
          </ul>

          <!-- Right Side Actions -->
          <div class="d-flex align-items-center gap-3">
            <!-- User Avatar -->
            <div class="user-avatar">
              <img 
                src="https://i.pravatar.cc/150?img=12" 
                alt="User"
                class="avatar-img"
              >
            </div>

            <!-- Logout Button -->
            <button class="btn btn-logout" @click="handleLogout">
              <i class="fas fa-sign-out-alt me-2"></i>Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer-custom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p class="mb-0">
              <i class="fas fa-paw me-2"></i>
              <strong>Project Adore</strong> - Connecting Cats with Loving Homes
            </p>
          </div>
          <div class="col-md-6 text-center text-md-end">
            <small class="text-muted">© 2025 Adore. All rights reserved.</small>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const handleLogout = () => {
  // Add your logout logic here
  console.log('Logging out...')
  // Example: navigateTo('/login')
}
</script>

<style scoped>
/* Navbar Styling */
.navbar-custom {
  background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%);
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
  padding: 15px 0;
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.logo-container {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: rotate(360deg) scale(1.1);
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.navbar-brand:hover .logo-container {
  animation: bounce 0.6s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.nav-link {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500;
  padding: 10px 20px !important;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.3s ease;
  z-index: -1;
}

.nav-link:hover::before {
  left: 0;
}

.nav-link:hover {
  color: white !important;
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  color: white !important;
  font-weight: 600;
}

.nav-link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 3px solid white;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.navbar-toggler {
  border: 2px solid white;
  padding: 8px 12px;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

/* Main Content */
.main-content {
  min-height: calc(100vh - 200px);
}

/* Footer */
.footer-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 0;
  margin-top: 60px;
}

.footer-custom p {
  color: white;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 991px) {
  .navbar-nav {
    margin-top: 20px;
    gap: 10px;
  }
  
  .nav-link {
    padding: 12px 20px !important;
    margin: 5px 0;
  }
  
  .d-flex.align-items-center {
    margin-top: 20px;
    justify-content: center;
  }
}
</style>