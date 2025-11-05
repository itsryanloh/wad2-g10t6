<template>
  <div class="profile-page">
    <div class="container-fluid">
      <div class="row">
        <!-- Left Sidebar Navigation (Same as profile index) -->
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
              >
                <i class="fas fa-user-cog"></i>
                <span>Profile Settings</span>
              </NuxtLink>

              <NuxtLink 
                to="/profile/myPost" 
                class="nav-item active"
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

        <!-- Main Content Area - My Posts -->
        <div class="col-md-9 col-lg-10 main-content">
          <div class="my-posts-page">
            <!-- Page Header -->
            <div class="page-header">
              <div>
                <h1 class="page-title">
                  <i class="fas fa-newspaper me-3"></i>My Posts
                </h1>
                <p class="page-subtitle">Manage your community contributions</p>
              </div>
            </div>

            <!-- Stats Cards -->
            <div v-if="userPosts.length > 0" class="stats-row">
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);">
                  <i class="fas fa-newspaper"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ userPosts.length }}</div>
                  <div class="stat-label">Total Posts</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);">
                  <i class="fas fa-heart"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalReactions }}</div>
                  <div class="stat-label">Total Reactions</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);">
                  <i class="fas fa-comment"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalComments }}</div>
                  <div class="stat-label">Total Comments</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);">
                  <i class="fas fa-eye"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalViews }}</div>
                  <div class="stat-label">Total Views</div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading || loadingUser" class="posts-grid">
              <div v-for="i in 4" :key="i" class="skeleton-card"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="userPosts.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <h3>No posts yet</h3>
              <p>Start sharing your cat stories with the community!</p>
              <button class="btn-primary" @click="navigateTo('/forum/createPost')">
                <i class="fas fa-plus"></i>
                <span>Create Your First Post</span>
              </button>
            </div>

            <!-- Posts Grid -->
            <div v-else class="posts-grid">
              <div v-for="post in userPosts" :key="post.id" class="post-card">
                <!-- Post Image -->
                <div class="post-image">
                  <img
                    v-if="post.image_urls && post.image_urls[0]"
                    :src="post.image_urls[0]"
                    :alt="post.title"
                  />
                  <div v-else class="post-placeholder">
                    <i class="fas fa-image"></i>
                  </div>
                  
                  <!-- Post Type Badge -->
                  <span :class="['post-badge', `badge-${post.post_type}`]">
                    {{ post.post_type }}
                  </span>

                  <!-- Resolved Badge -->
                  <span v-if="post.is_resolved" class="resolved-badge">
                    <i class="fas fa-check-circle"></i>
                  </span>
                </div>

                <!-- Post Content -->
                <div class="post-body">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-excerpt">{{ truncateText(post.content, 80) }}</p>

                  <!-- Post Meta -->
                  <div class="post-meta">
                    <span class="meta-item">
                      <i class="far fa-calendar"></i>
                      {{ formatDate(post.created_at) }}
                    </span>
                    <span class="meta-item">
                      <i class="far fa-eye"></i>
                      {{ post.view_count || 0 }}
                    </span>
                    <span class="meta-item">
                      <i class="far fa-comment"></i>
                      {{ post.comment_count || 0 }}
                    </span>
                    <span class="meta-item">
                      <i class="far fa-heart"></i>
                      {{ post.reaction_count || 0 }}
                    </span>
                  </div>

                  <!-- Action Buttons -->
                  <div class="post-actions">
                    <button 
                      class="btn-action btn-view" 
                      @click="navigateTo(`/forum/${post.id}`)"
                    >
                      <i class="fas fa-eye me-1"></i>View
                    </button>
                    <button 
                      class="btn-action btn-edit" 
                      @click="navigateTo(`/forum/editPost?postId=${post.id}`)"
                    >
                      <i class="fas fa-edit me-1"></i>Edit
                    </button>
                    <button 
                      class="btn-action btn-delete" 
                      @click="confirmDelete(post)"
                    >
                      <i class="fas fa-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
              <div class="modal-content delete-modal" @click.stop>
                <div class="modal-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="modal-title">Delete Post?</h3>
                <p class="modal-text">
                  Are you sure you want to delete "<strong>{{ postToDelete?.title }}</strong>"? 
                  This action cannot be undone.
                </p>
                <div class="modal-actions">
                  <button 
                    class="btn btn-cancel" 
                    @click="showDeleteModal = false"
                    :disabled="deleting"
                  >
                    Cancel
                  </button>
                  <button 
                    class="btn btn-delete-confirm" 
                    @click="handleDelete"
                    :disabled="deleting"
                  >
                    <i class="fas fa-trash me-2"></i>
                    {{ deleting ? 'Deleting...' : 'Yes, Delete' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Success Toast -->
            <div v-if="showSuccess" class="success-toast">
              <i class="fas fa-check-circle me-2"></i>
              {{ successMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForum } from '~/composables/useForum'

const router = useRouter()
const token = useCookie("token")
const { posts, loading, fetchPosts, deletePost } = useForum()

// Get current user ID from database
const currentUser = ref(null)
const currentUserId = ref(null)
const loadingUser = ref(true)

const showDeleteModal = ref(false)
const postToDelete = ref(null)
const deleting = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')

// Filter posts by current user
const userPosts = computed(() => {
  if (!currentUserId.value) return []
  return posts.value.filter(post => post.user_id === currentUserId.value)
})

// Calculate stats
const totalReactions = computed(() => {
  return userPosts.value.reduce((sum, post) => sum + (post.reaction_count || 0), 0)
})

const totalComments = computed(() => {
  return userPosts.value.reduce((sum, post) => sum + (post.comment_count || 0), 0)
})

const totalViews = computed(() => {
  return userPosts.value.reduce((sum, post) => sum + (post.view_count || 0), 0)
})

onMounted(async () => {
  if (!token.value) return await navigateTo("/login");

  try {
    const base_url = import.meta.env.VITE_BASE_URL;
    const tokenResponse = await fetch(`${base_url}/auth/me`, { headers: { Authorization: `Bearer ${token.value}` } });
    const tokenData = await tokenResponse.json();

    // Fetch current user ID from database
    // TODO: avoid fetch all (exposes all users)
    const userResponse = await fetch(`${base_url}/users`)
    const users = await userResponse.json()
    
    // Find current user
    const targetUser = users.find(user => user.username === tokenData.username)
    
    if (targetUser) {
      currentUser.value = targetUser
      currentUserId.value = targetUser.id
      console.log('Loaded user for My Posts:', targetUser.name)
    }
    
    loadingUser.value = false
    
    // Fetch all posts
    await fetchPosts()
  } catch (error) {
    console.error('Error fetching data:', error)
    loadingUser.value = false
  }
})

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? `${text.substring(0, length)}...` : text
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-SG', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

const confirmDelete = (post) => {
  postToDelete.value = post
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!postToDelete.value) return

  deleting.value = true

  try {
    const success = await deletePost(postToDelete.value.id)

    if (success) {
      showDeleteModal.value = false
      postToDelete.value = null
      
      successMessage.value = 'Post deleted successfully'
      showSuccess.value = true
      setTimeout(() => showSuccess.value = false, 3000)
      
      console.log('Post deleted successfully')
    } else {
      throw new Error('Delete failed')
    }
  } catch (error) {
    console.error('Error deleting post:', error)
    successMessage.value = 'Failed to delete post. Please try again.'
    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 3000)
  } finally {
    deleting.value = false
  }
}

const handleLogout = () => {
  router.push('/forum/main')
}
</script>

<style scoped>
/* Use all styles from profile index.vue for consistency */
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

/* Sidebar Styles (Same as profile index) */
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

.my-posts-page {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #5D4E37;
  margin-bottom: 5px;
}

.page-subtitle {
  color: #7A7265;
  font-size: 1rem;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #5D4E37;
}

.stat-label {
  color: #7A7265;
  font-size: 0.9rem;
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.post-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.post-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFB74D;
  font-size: 3rem;
}

.post-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
}

.badge-adoption { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); }
.badge-sighting { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); }
.badge-lost { background: linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%); }
.badge-found { background: linear-gradient(135deg, #51CF66 0%, #37B24D 100%); }
.badge-discussion { background: linear-gradient(135deg, #4DABF7 0%, #339AF0 100%); }

.resolved-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(76, 175, 80, 0.95);
  color: white;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.post-body {
  padding: 20px;
}

.post-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 0 0 10px;
  line-height: 1.4;
}

.post-excerpt {
  color: #7A7265;
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.5;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #FFE8D6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7A7265;
  font-size: 0.85rem;
}

.meta-item i {
  color: #FFB74D;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.btn-view:hover {
  background: #2196F3;
  color: white;
}

.btn-edit {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.btn-edit:hover {
  background: #FF9800;
  color: white;
}

.btn-delete {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.btn-delete:hover {
  background: #FF6B6B;
  color: white;
}

/* Skeleton Loading */
.skeleton-card {
  height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 15px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.empty-state i {
  font-size: 5rem;
  color: #FFB74D;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #5D4E37;
  margin-bottom: 10px;
}

.empty-state p {
  color: #7A7265;
  margin-bottom: 30px;
}

.btn-primary {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-primary i {
  font-size: 1.3rem;
  line-height: 1;
  position: relative;
  top: 11px;                        
}

.btn-primary span {
  font-size: 1.05rem;
  line-height: 1.05rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}


.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}

/* Delete Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.delete-modal {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 450px;
  width: 90%;
  text-align: center;
  animation: scaleIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
}

.modal-title {
  font-size: 1.8rem;
  color: #5D4E37;
  margin-bottom: 15px;
}

.modal-text {
  color: #7A7265;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.modal-actions {
  display: flex;
  gap: 15px;
}

.btn {
  flex: 1;
  padding: 12px 25px;
  border-radius: 10px;
  font-weight: 600;
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

.btn-delete-confirm {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.btn-delete-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: relative;
    min-height: auto;
  }

  .main-content {
    padding: 20px;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .post-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
