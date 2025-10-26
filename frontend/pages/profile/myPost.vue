<template>
  <div class="profile-page">
    <div v-if="loadingUser || loading" class="loading-fullpage">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading your posts...</p>
    </div>

    <div v-else class="container-fluid">
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
              <h4 class="user-name">{{ currentUser?.name || 'User' }}</h4>
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

            <!-- Posts Grid -->
            <div v-if="userPosts.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <h3>No posts yet</h3>
              <p>Start sharing with the community!</p>
              <button class="btn btn-primary-custom" @click="navigateTo('/forum/createPost')">
                <i class="fas fa-plus me-2"></i>Create First Post
              </button>
            </div>

            <div v-else class="posts-grid">
              <div
                v-for="post in userPosts"
                :key="post.id"
                class="post-card"
              >
                <!-- Post Header -->
                <div class="post-header">
                  <div class="post-type-badge" :class="post.post_type">
                    {{ post.post_type }}
                  </div>
                  <div class="post-actions">
                    <button 
                      class="btn-icon btn-edit" 
                      @click="handleEdit(post.id)"
                      title="Edit post"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-icon btn-delete" 
                      @click="confirmDelete(post)"
                      title="Delete post"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Post Image -->
                <div v-if="post.image_urls?.length" class="post-image-wrapper" @click="navigateTo(`/forum/${post.id}`)">
                  <img
                    :src="post.image_urls[0]"
                    :alt="post.title"
                    class="post-image"
                  />
                  <div v-if="post.image_urls.length > 1" class="image-count-badge">
                    <i class="fas fa-images me-1"></i>
                    {{ post.image_urls.length }}
                  </div>
                </div>

                <!-- Post Content -->
                <div class="post-content" @click="navigateTo(`/forum/${post.id}`)">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-text">{{ truncateText(post.content, 150) }}</p>

                  <div v-if="post.location_name" class="location-tag">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    {{ post.location_name }}
                  </div>

                  <div v-if="post.tags?.length" class="tags-container">
                    <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag-badge">
                      #{{ tag }}
                    </span>
                    <span v-if="post.tags.length > 3" class="more-tags">
                      +{{ post.tags.length - 3 }} more
                    </span>
                  </div>
                </div>

                <!-- Post Footer -->
                <div class="post-footer">
                  <div class="stat-group">
                    <span class="stat">
                      <i class="fas fa-heart"></i>
                      {{ post.reaction_count || 0 }}
                    </span>
                    <span class="stat">
                      <i class="fas fa-comment"></i>
                      {{ post.comment_count || 0 }}
                    </span>
                    <span class="stat">
                      <i class="fas fa-eye"></i>
                      {{ post.view_count || 0 }}
                    </span>
                  </div>
                  <span class="post-date">{{ formatDate(post.created_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
              <div class="modal-content modal-delete" @click.stop>
                <div class="modal-icon-delete">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="modal-title-delete">Delete Post?</h3>
                <p class="modal-text-delete">
                  Are you sure you want to delete "{{ postToDelete?.title }}"?
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

const currentUser = ref(null)
const currentUserId = ref(null)
const loadingUser = ref(true)

const showDeleteModal = ref(false)
const postToDelete = ref(null)
const deleting = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')

const userPosts = computed(() => {
  if (!currentUserId.value) return []
  return posts.value.filter(post => post.user_id === currentUserId.value)
})

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

    const userResponse = await fetch(`${base_url}/users`)
    const users = await userResponse.json()
    
    const targetUser = users.find(user => user.username === tokenData.username)
    
    if (targetUser) {
      currentUser.value = targetUser
      currentUserId.value = targetUser.id
      console.log('Loaded user for My Posts:', targetUser.name)
    }
    
    await fetchPosts()
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loadingUser.value = false
  }
})

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateTo = (path) => {
  router.push(path)
}

const handleEdit = (postId) => {
  router.push(`/forum/editPost?postId=${postId}`)  
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
      successMessage.value = 'Post deleted successfully'
      showSuccess.value = true
      setTimeout(() => showSuccess.value = false, 3000)
      
      await fetchPosts()
    }
  } catch (error) {
    console.error('Error deleting post:', error)
    alert('Failed to delete post')
  } finally {
    deleting.value = false
    showDeleteModal.value = false
    postToDelete.value = null
  }
}

const handleLogout = () => {
  token.value = null
  router.push('/')
  window.location.reload()
}
</script>

<style scoped>
.profile-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  min-height: 100vh;
}

.loading-fullpage {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-fullpage i {
  font-size: 4rem;
  color: #FF9800;
  margin-bottom: 20px;
}

.loading-fullpage p {
  color: #7A7265;
  font-size: 1.2rem;
  margin: 0;
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
  align-items: center;
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
  margin: 0;
}

/* Stats Cards */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
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
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #5D4E37;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  color: #7A7265;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Posts Grid */
.posts-grid {
  display: grid;
  gap: 25px;
}

.post-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.post-type-badge {
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.post-type-badge.adoption {
  background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%);
  color: white;
}

.post-type-badge.sighting {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
}

.post-type-badge.lost {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
}

.post-type-badge.found {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  color: white;
}

.post-type-badge.discussion {
  background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
  color: white;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-edit {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.btn-edit:hover {
  background: #2196F3;
  color: white;
  transform: scale(1.1);
}

.btn-delete {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.btn-delete:hover {
  background: #F44336;
  color: white;
  transform: scale(1.1);
}

.post-image-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card:hover .post-image {
  transform: scale(1.05);
}

.image-count-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.post-content {
  padding: 20px;
  cursor: pointer;
}

.post-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.post-text {
  color: #7A7265;
  margin: 0 0 15px 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.location-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%);
  color: #E65100;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.tags-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag-badge {
  padding: 5px 12px;
  background: #f5f5f5;
  color: #7A7265;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.more-tags {
  padding: 5px 12px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  color: white;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #f5f5f5;
  background: #FFFBF5;
}

.stat-group {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7A7265;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat i {
  color: #FF9800;
}

.post-date {
  color: #999;
  font-size: 0.85rem;
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
  font-size: 4rem;
  color: #FFB74D;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #5D4E37;
  margin-bottom: 10px;
}

.empty-state p {
  color: #7A7265;
  margin-bottom: 30px;
}

.btn-primary-custom {
  padding: 15px 40px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);
}

.btn-primary-custom:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(255, 152, 0, 0.4);
}

/* Delete Modal */
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
  padding: 40px;
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s;
  text-align: center;
}

.modal-delete {
  text-align: center;
}

.modal-icon-delete {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F44336;
  font-size: 2.5rem;
}

.modal-title-delete {
  color: #5D4E37;
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-text-delete {
  color: #7A7265;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
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

.btn-delete-confirm {
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
}

.btn-delete-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(244, 67, 54, 0.4);
}

.btn-delete-confirm:disabled,
.btn-cancel:disabled {
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
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>