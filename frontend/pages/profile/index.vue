<template>
  <div class="profile-page">
    <div class="container-fluid">
      <div class="row">
        <!-- Left Sidebar Navigation -->
        <div class="col-md-3 col-lg-2 sidebar">
          <div class="sidebar-content">
            <!-- User Profile Summary -->
            <div class="user-summary">
              <div class="avatar-large">
                <img 
                  v-if="currentUser?.avatar_url" 
                  :src="currentUser.avatar_url" 
                  :alt="currentUser.name"
                />
                <i v-else class="fas fa-user"></i>
              </div>
              <h4 class="user-name">{{ currentUser?.name || 'Loading...' }}</h4>
              <p class="user-username">@{{ currentUser?.username || '' }}</p>
            </div>

            <!-- Navigation Menu -->
            <nav class="sidebar-nav">
              <NuxtLink 
                to="/profile" 
                class="nav-item"
                :class="{ active: route.path === '/profile' }"
                exact
              >
                <i class="fas fa-user-cog"></i>
                <span>Profile Settings</span>
              </NuxtLink>

              <NuxtLink 
                to="/profile/myPost" 
                class="nav-item"
                :class="{ active: route.path === '/profile/myPost' }"
              >
                <i class="fas fa-newspaper"></i>
                <span>My Posts</span>
              </NuxtLink>

              <button class="nav-item logout-btn" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Main Content Area - Profile Settings -->
        <div class="col-md-9 col-lg-10 main-content">
          <div class="settings-page">
            <!-- Page Header -->
            <div class="page-header">
              <h1 class="page-title">
                <i class="fas fa-user-cog me-3"></i>Profile Settings
              </h1>
              <p class="page-subtitle">Manage your account information</p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-card">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Loading your profile...</p>
            </div>

            <!-- Settings Form Card -->
            <div v-else class="settings-card">
              <form @submit.prevent="handleSubmit">
                <!-- Avatar Upload Section -->
                <div class="form-section">
                  <label class="section-label">Profile Picture</label>
                  <div class="avatar-upload-section">
                    <div class="avatar-preview">
                      <img 
                        v-if="form.avatar_url" 
                        :src="form.avatar_url" 
                        alt="Avatar"
                      />
                      <i v-else class="fas fa-user"></i>
                    </div>
                    <div class="avatar-upload-info">
                      <button 
                        type="button" 
                        class="btn-upload" 
                        @click="$refs.avatarInput.click()"
                        :disabled="uploadingAvatar"
                      >
                        <i class="fas fa-camera me-2"></i>
                        {{ uploadingAvatar ? 'Uploading...' : 'Change Photo' }}
                      </button>
                      <input
                        ref="avatarInput"
                        type="file"
                        accept="image/*"
                        @change="handleAvatarUpload"
                        style="display: none;"
                      />
                      <small class="upload-hint">JPG, PNG or GIF. Max 2MB</small>
                    </div>
                  </div>
                  <small v-if="uploadError" class="error-text">{{ uploadError }}</small>
                </div>

                <!-- Basic Information -->
                <div class="form-section">
                  <label class="section-label">
                    <i class="fas fa-user me-2"></i>Full Name
                    <span class="required">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div class="form-section">
                  <label class="section-label">
                    <i class="fas fa-at me-2"></i>Username
                    <span class="required">*</span>
                  </label>
                  <input
                    v-model="form.username"
                    type="text"
                    class="form-input"
                    placeholder="Enter your username"
                    required
                  />
                  <small class="form-hint">This is how others will identify you</small>
                </div>

                <div class="form-section">
                  <label class="section-label">
                    <i class="fas fa-phone me-2"></i>Contact Number
                  </label>
                  <input
                    v-model="form.contact_no"
                    type="tel"
                    class="form-input"
                    placeholder="+65 1234 5678"
                  />
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-section">
                      <label class="section-label">
                        <i class="fas fa-birthday-cake me-2"></i>Age
                      </label>
                      <input
                        v-model.number="form.age"
                        type="number"
                        class="form-input"
                        placeholder="Enter your age"
                        min="1"
                        max="150"
                      />
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="form-section">
                      <label class="section-label">
                        <i class="fas fa-venus-mars me-2"></i>Gender
                      </label>
                      <select v-model="form.gender" class="form-input">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Password Change Section -->
                <div class="form-section password-section">
                  <label class="section-label">
                    <i class="fas fa-lock me-2"></i>Change Password
                  </label>
                  <button 
                    type="button" 
                    class="btn-secondary"
                    @click="showPasswordModal = true"
                  >
                    <i class="fas fa-key me-2"></i>Update Password
                  </button>
                  <small class="form-hint">Click to change your password</small>
                </div>

                <!-- Action Buttons -->
                <div class="form-actions">
                  <button 
                    type="button" 
                    class="btn btn-cancel" 
                    @click="navigateTo('/')"
                    :disabled="saving"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-save"
                    :disabled="saving || !isFormValid"
                  >
                    <i class="fas fa-save me-2"></i>
                    {{ saving ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Password Change Modal -->
            <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
              <div class="modal-content" @click.stop>
                <div class="modal-header">
                  <h3>Change Password</h3>
                  <button class="close-btn" @click="showPasswordModal = false">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="form-section">
                    <label class="section-label">Current Password</label>
                    <input
                      v-model="passwordForm.current"
                      type="password"
                      class="form-input"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div class="form-section">
                    <label class="section-label">New Password</label>
                    <input
                      v-model="passwordForm.new"
                      type="password"
                      class="form-input"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div class="form-section">
                    <label class="section-label">Confirm New Password</label>
                    <input
                      v-model="passwordForm.confirm"
                      type="password"
                      class="form-input"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <small v-if="passwordError" class="error-text">{{ passwordError }}</small>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-cancel" @click="showPasswordModal = false">
                    Cancel
                  </button>
                  <button class="btn btn-save" @click="handlePasswordChange">
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            <!-- Success Toast -->
            <div v-if="showSuccess" class="success-toast">
              <i class="fas fa-check-circle me-2"></i>
              Settings saved successfully!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const uploadingAvatar = ref(false)
const uploadError = ref('')
const saving = ref(false)
const showPasswordModal = ref(false)
const showSuccess = ref(false)
const avatarInput = ref(null)

// Get current user - fetch from first user in database
const currentUser = ref(null)
const currentUserId = ref(null)

const form = ref({
  id: null,
  name: '',
  username: '',
  contact_no: '',
  age: null,
  gender: '',
  avatar_url: null
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const passwordError = ref('')

// Fetch user data on mount - using David Chen's data
onMounted(async () => {
  try {
    // Fetch all users from database
    const response = await fetch('http://localhost:3000/api/users')
    const users = await response.json()
    
    // Find David Chen or use first user
    const davidChen = users.find(user => 
      user.username === 'david_chen'
    )
    
    const targetUser = davidChen || users[0]
    
    if (targetUser) {
      currentUser.value = targetUser
      currentUserId.value = targetUser.id
      
      // Populate form with user data from database
      form.value = {
        id: targetUser.id,
        name: targetUser.name || '',
        username: targetUser.username || '',
        contact_no: targetUser.contact_no || '',
        age: targetUser.age || null,
        gender: targetUser.gender || '',
        avatar_url: targetUser.avatar_url || null
      }
      
      console.log('Loaded user:', targetUser.name)
    } else {
      throw new Error('No users found in database')
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    uploadError.value = 'Failed to load user data. Please check database connection.'
  } finally {
    loading.value = false
  }
})

const isFormValid = computed(() => {
  return form.value.name?.trim() && form.value.username?.trim()
})

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please upload an image file'
    setTimeout(() => uploadError.value = '', 3000)
    return
  }

  // Validate file size (2MB for avatars)
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = 'Avatar image must be less than 2MB'
    setTimeout(() => uploadError.value = '', 3000)
    return
  }

  uploadingAvatar.value = true
  uploadError.value = ''

  try {
    const formData = new FormData()
    formData.append('avatar', file) // Changed from 'images' to 'avatar'
    formData.append('user_id', form.value.id) // Pass user ID for filename

    // Upload to dedicated avatar endpoint
    const response = await fetch('http://localhost:3000/api/avatars/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    // Update avatar URL
    form.value.avatar_url = data.url
    
    console.log('Avatar uploaded successfully:', data.url)
  } catch (error) {
    console.error('Error uploading avatar:', error)
    uploadError.value = error.message || 'Failed to upload avatar'
    setTimeout(() => uploadError.value = '', 5000)
  } finally {
    uploadingAvatar.value = false
    // Reset file input
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  saving.value = true
  uploadError.value = ''

  try {
    console.log('Saving profile data:', form.value)
    
    const response = await fetch(`http://localhost:3000/api/users/${form.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.value.name.trim(),
        username: form.value.username.trim(),
        contact_no: form.value.contact_no?.trim() || null,
        age: form.value.age || null,
        gender: form.value.gender || null,
        avatar_url: form.value.avatar_url || null
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save settings')
    }

    const updatedUser = await response.json()
    
    // Update local state with saved data
    currentUser.value = updatedUser
    form.value = {
      id: updatedUser.id,
      name: updatedUser.name || '',
      username: updatedUser.username || '',
      contact_no: updatedUser.contact_no || '',
      age: updatedUser.age || null,
      gender: updatedUser.gender || '',
      avatar_url: updatedUser.avatar_url || null
    }
    
    console.log('Profile updated successfully:', updatedUser)

    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 3000)
  } catch (error) {
    console.error('Error saving settings:', error)
    uploadError.value = error.message || 'Failed to save settings. Please try again.'
    setTimeout(() => uploadError.value = '', 5000)
  } finally {
    saving.value = false
  }
}

const handlePasswordChange = async () => {
  if (!passwordForm.value.current || !passwordForm.value.new || !passwordForm.value.confirm) {
    passwordError.value = 'All fields are required'
    return
  }

  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = 'Passwords do not match'
    return
  }

  if (passwordForm.value.new.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/auth/password/${form.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_password: passwordForm.value.current,
        new_password: passwordForm.value.new
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to change password')
    }
    
    showPasswordModal.value = false
    passwordForm.value = { current: '', new: '', confirm: '' }
    passwordError.value = ''
    
    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 3000)
  } catch (error) {
    passwordError.value = error.message || 'Failed to change password'
  }
}

const handleLogout = () => {
  // TODO: Implement actual logout
  router.push('/forum/main')
}
</script>

<style scoped>
/* Include all the CSS from settings.vue + sidebar styles */
.profile-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  min-height: 100vh;
}

.container-fluid {
  padding: 0;
}

.row {
  margin: 0;
}

/* Sidebar Styles */
.sidebar {
  background: white;
  min-height: 100vh;
  padding: 0;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
}

.sidebar-content {
  padding: 30px 20px;
}

.user-summary {
  text-align: center;
  padding-bottom: 30px;
  border-bottom: 2px solid #FFE8D6;
  margin-bottom: 30px;
}

.avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 15px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4px solid #FFE8D6;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-large i {
  font-size: 2.5rem;
  color: white;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 10px 0 5px;
}

.user-username {
  color: #7A7265;
  font-size: 0.95rem;
  margin: 0;
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border-radius: 12px;
  color: #5D4E37;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 600;
  border: 2px solid transparent;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.nav-item i {
  font-size: 1.2rem;
  width: 25px;
  text-align: center;
}

.nav-item:hover {
  background: rgba(255, 183, 77, 0.1);
  border-color: #FFB74D;
  transform: translateX(5px);
}

.nav-item.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-color: #FF9800;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.logout-btn {
  margin-top: 20px;
  color: #FF6B6B;
}

.logout-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: #FF6B6B;
  color: #FF6B6B;
  transform: translateX(5px);
}

/* Main Content */
.main-content {
  padding: 40px;
  min-height: 100vh;
}

.settings-page {
  max-width: 900px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #5D4E37;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #7A7265;
  font-size: 1.1rem;
}

.loading-card {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.loading-card i {
  font-size: 3rem;
  color: #FF9800;
  margin-bottom: 20px;
}

.loading-card p {
  color: #7A7265;
  font-size: 1.1rem;
}

.settings-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 25px;
}

.section-label {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 10px;
  font-size: 1rem;
}

.required {
  color: #FF6B6B;
  margin-left: 5px;
}

.form-input {
  width: 100%;
  padding: 12px 18px;
  border: 2px solid #FFB74D;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.form-hint {
  display: block;
  color: #7A7265;
  font-size: 0.85rem;
  margin-top: 5px;
}

/* Avatar Upload */
.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #FFE8D6;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview i {
  font-size: 2.5rem;
  color: white;
}

.avatar-upload-info {
  flex: 1;
}

.btn-upload {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-upload:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.btn-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-hint {
  display: block;
  margin-top: 8px;
}

.password-section {
  padding: 20px;
  background: rgba(255, 183, 77, 0.05);
  border-radius: 12px;
  border: 2px solid #FFE8D6;
}

.btn-secondary {
  background: white;
  border: 2px solid #FFB74D;
  color: #FF9800;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 183, 77, 0.1);
  border-color: #FF9800;
}

/* Action Buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #FFE8D6;
}

.btn {
  padding: 12px 30px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-save {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #5D4E37;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #7A7265;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #FF6B6B;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Success Toast */
.success-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
  color: white;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(76, 175, 80, 0.3);
  font-weight: 600;
  animation: slideInRight 0.3s;
  z-index: 1001;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.error-text {
  display: block;
  color: #FF6B6B;
  font-size: 0.85rem;
  margin-top: 8px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: relative;
    min-height: auto;
  }

  .main-content {
    padding: 20px;
  }

  .settings-card {
    padding: 25px;
  }

  .avatar-upload-section {
    flex-direction: column;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
