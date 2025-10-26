<template>
  <div class="forum-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container hero-content">
        <h1 class="hero-title">
          <i class="fas fa-comments me-3"></i>Community Forum
        </h1>
        <p class="hero-subtitle">Share, discover, and connect with fellow cat lovers</p>
      </div>
      <div class="wave-animation">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
        </svg>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container content-container">
      <div class="row">
        <!-- Community Sidebar -->
        <div class="col-lg-3 col-md-4 mb-4">
          <div class="sidebar-wrapper">
            <!-- Communities Component (Clean - No Browse Button) -->
            <CommunitySidebar
              :userCommunities="userCommunities"
              :loading="loadingCommunities"
              :selectedId="selectedCommunityId"
              @select-community="handleCommunitySelect"
            />
            
            <!-- Action Buttons (In Main.vue) -->
            <div class="sidebar-actions">
              <!-- Find More Communities Button -->
              <button 
                @click="showBrowseModal = true" 
                class="btn-browse-communities"
              >
                <i class="fas fa-compass me-2"></i>
                Find More Communities
              </button>
              
              <!-- Create Community Button -->
              <button 
                v-if="currentUserId"
                @click="showCreateModal = true" 
                class="btn-create-community"
              >
                <i class="fas fa-plus-circle me-2"></i>
                Create Community
              </button>
            </div>
          </div>
        </div>

        <!-- Main Posts Area -->
        <div class="col-lg-9 col-md-8">
          <!-- Search & Filter Card -->
          <div class="search-card">
            <div class="row g-4">
              <!-- Search Bar -->
              <div class="col-lg-12">
                <div class="search-wrapper">
                  <i class="fas fa-search search-icon"></i>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="search-input"
                    placeholder="Search posts by title, content, or tags..."
                  />
                  <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="clear-btn"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Filter Chips -->
              <div class="col-12">
                <div class="filter-section">
                  <span class="filter-label">
                    <i class="fas fa-filter me-2"></i>Filter by:
                  </span>
                  <div class="filter-chips">
                    <button
                      v-for="type in postTypes"
                      :key="type.value"
                      @click="toggleFilter(type.value)"
                      :class="['filter-chip', { active: selectedType === type.value }]"
                    >
                      <i :class="type.icon" class="me-2"></i>
                      {{ type.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Posts Grid -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading posts...</p>
          </div>

          <div v-else-if="filteredPosts.length > 0" class="posts-grid">
            <div
              v-for="post in filteredPosts"
              :key="post.id"
              class="post-card"
              @click="navigateTo(`/forum/${post.id}`)"
            >
              <!-- Post Header -->
              <div class="post-header">
                <div class="user-info">
                  <div class="user-avatar">
                    <img
                      v-if="post.users?.avatar_url"
                      :src="post.users.avatar_url"
                      :alt="post.users.name"
                      @error="handleImageError"
                    />
                    <i v-else class="fas fa-user"></i>
                  </div>
                  <div class="user-details">
                    <span class="user-name">{{ post.users?.name || 'Anonymous' }}</span>
                    <span class="post-time">{{ formatDate(post.created_at) }}</span>
                  </div>
                </div>
                <div :class="`post-type-badge ${post.post_type}`">
                  {{ post.post_type }}
                </div>
              </div>

              <!-- Post Image -->
              <div v-if="post.image_urls?.length" class="post-image-wrapper">
                <img
                  :src="post.image_urls[0]"
                  :alt="post.title"
                  class="post-image"
                  @error="handleImageError"
                />
                <div v-if="post.image_urls.length > 1" class="image-count-badge">
                  <i class="fas fa-images me-1"></i>
                  {{ post.image_urls.length }}
                </div>
              </div>

              <!-- Post Content -->
              <div class="post-content">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-text">{{ truncateText(post.content, 150) }}</p>

                <!-- Location -->
                <div v-if="post.location_name" class="location-tag">
                  <i class="fas fa-map-marker-alt me-1"></i>
                  {{ post.location_name }}
                </div>

                <!-- Tags -->
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
                <button class="view-btn">
                  View Post <i class="fas fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No posts found</h3>
            <p>Try adjusting your filters or create a new post</p>
            <button class="btn btn-primary-custom" @click="navigateTo('/forum/createPost')">
              <i class="fas fa-plus me-2"></i>Create First Post
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Browse Communities Modal -->
    <div v-if="showBrowseModal" class="modal-overlay" @click="showBrowseModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-compass me-2"></i>Browse Communities</h3>
          <button class="close-btn" @click="showBrowseModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingAllCommunities" class="loading-state">
            <div class="spinner"></div>
            <p>Loading communities...</p>
          </div>
          
          <div v-else-if="availableCommunities.length > 0" class="communities-list-modal">
            <div
              v-for="community in availableCommunities"
              :key="community.id"
              class="community-card"
            >
              <div class="community-card-content">
                <div class="community-icon-large">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="community-details">
                  <h4>{{ community.name }}</h4>
                  <p>{{ community.description || 'No description available' }}</p>
                  <div class="community-meta">
                    <span><i class="fas fa-users"></i> {{ community.member_count || 0 }} members</span>
                    <span><i class="fas fa-newspaper"></i> {{ community.post_count || 0 }} posts</span>
                  </div>
                </div>
              </div>
              <button
                v-if="!isMemberOfCommunity(community.id)"
                @click="handleJoinCommunity(community.id)"
                :disabled="joiningCommunity === community.id"
                class="btn-join"
              >
                <i class="fas fa-plus me-2"></i>
                {{ joiningCommunity === community.id ? 'Joining...' : 'Join' }}
              </button>
              <button
                v-else
                @click="handleLeaveCommunity(community.id)"
                :disabled="leavingCommunity === community.id"
                class="btn-leave"
              >
                <i class="fas fa-check me-2"></i>
                {{ leavingCommunity === community.id ? 'Leaving...' : 'Joined' }}
              </button>
            </div>
          </div>
          
          <div v-else class="empty-state-modal">
            <i class="fas fa-users-slash"></i>
            <p>No communities available</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Community Modal -->
    <CreateCommunityModal
      :show="showCreateModal"
      :user-id="currentUserId"
      @close="showCreateModal = false"
      @created="handleCommunityCreated"
    />

    <!-- Floating Action Button -->
    <Teleport to="body">
      <button 
        class="fab-fixed" 
        @click="navigateTo('/forum/createPost')" 
        title="Create New Post"
      >
        <i class="fas fa-plus"></i>
      </button>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useForum } from '~/composables/useForum'
import { useCommunities } from '~/composables/useCommunities'
import CommunitySidebar from '~/components/CommunitySidebar.vue'
import CreateCommunityModal from '~/components/CreateCommunityModal.vue'

//Composables
const { posts, loading, fetchPosts } = useForum()
const {
  communities,
  loading: loadingAllCommunities,
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  fetchUserCommunities,
  fetchCommunityPosts
} = useCommunities()

const token = useCookie('token')
const base_url = import.meta.env.VITE_BASE_URL

//State
const searchQuery = ref('')
const selectedType = ref(null)
const selectedCommunityId = ref(null)
const userCommunities = ref([])
const loadingCommunities = ref(false)
const currentUserId = ref(null)
const showBrowseModal = ref(false)
const showCreateModal = ref(false)
const joiningCommunity = ref(null)
const leavingCommunity = ref(null)

const postTypes = [
  { value: 'adoption', label: 'Adoption', icon: 'fas fa-heart' },
  { value: 'sighting', label: 'Sighting', icon: 'fas fa-eye' },
  { value: 'lost', label: 'Lost', icon: 'fas fa-exclamation-triangle' },
  { value: 'found', label: 'Found', icon: 'fas fa-check-circle' },
  { value: 'discussion', label: 'Discussion', icon: 'fas fa-comments' },
]

//Get current user from token
const getCurrentUser = async () => {
  if (!token.value) return null
  
  try {
    const response = await fetch(`${base_url}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (!response.ok) return null
    
    const tokenData = await response.json()
    
    const usersResponse = await fetch(`${base_url}/users`)
    const users = await usersResponse.json()
    
    const user = users.find(u => u.username === tokenData.username)
    return user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

const filteredPosts = computed(() => {
  let result = posts.value || []

  if (selectedType.value) {
    result = result.filter(post => post.post_type === selectedType.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post => {
      return (
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    })
  }

  return result
})

const availableCommunities = computed(() => {
  return communities.value || []
})

const toggleFilter = (type) => {
  selectedType.value = selectedType.value === type ? null : type
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateTo = (path) => {
  window.location.href = path
}

//Community Functions
const handleCommunitySelect = async (community) => {
  if (!community) {
    selectedCommunityId.value = null
    await fetchPosts()
  } else {
    selectedCommunityId.value = community.id
    const communityPosts = await fetchCommunityPosts(community.id)
    posts.value = communityPosts
  }
}

const isMemberOfCommunity = (communityId) => {
  return userCommunities.value.some(
    membership => membership.communities?.id === communityId
  )
}

const handleJoinCommunity = async (communityId) => {
  if (!currentUserId.value) {
    alert('Please sign in to join communities')
    return
  }

  joiningCommunity.value = communityId

  try {
    const success = await joinCommunity(communityId, currentUserId.value)
    
    if (success) {
      await loadUserCommunities()
      alert('Successfully joined community!')
    } else {
      alert('Failed to join community')
    }
  } catch (error) {
    console.error('Error joining community:', error)
    alert('Failed to join community')
  } finally {
    joiningCommunity.value = null
  }
}

const handleLeaveCommunity = async (communityId) => {
  if (!currentUserId.value) return

  if (!confirm('Are you sure you want to leave this community?')) return

  leavingCommunity.value = communityId

  try {
    const success = await leaveCommunity(communityId, currentUserId.value)
    
    if (success) {
      await loadUserCommunities()
      
      if (selectedCommunityId.value === communityId) {
        selectedCommunityId.value = null
        await fetchPosts()
      }
      
      alert('Successfully left community')
    } else {
      alert('Failed to leave community')
    }
  } catch (error) {
    console.error('Error leaving community:', error)
    alert('Failed to leave community')
  } finally {
    leavingCommunity.value = null
  }
}

const loadUserCommunities = async () => {
  if (!currentUserId.value) {
    userCommunities.value = []
    return
  }

  try {
    loadingCommunities.value = true
    userCommunities.value = await fetchUserCommunities(currentUserId.value)
  } catch (error) {
    console.error('Error loading user communities:', error)
    userCommunities.value = []
  } finally {
    loadingCommunities.value = false
  }
}

const handleCommunityCreated = async (newCommunity) => {
  console.log('✅ New community created:', newCommunity)
  
  const linkedCount = newCommunity.linked_posts_count || 0
  let message = `Community "${newCommunity.name}" created successfully!`
  
  if (linkedCount > 0) {
    message += `\n\n${linkedCount} existing post(s) have been automatically linked to this community!`
  }
  
  alert(message)
  
  await fetchPosts()
  await fetchCommunities()
  
  if (currentUserId.value) {
    await loadUserCommunities()
  }
  
  console.log('✅ All data refreshed after community creation')
}

//Initialize
onMounted(async () => {
  const user = await getCurrentUser()
  if (user) {
    currentUserId.value = user.id
    await loadUserCommunities()
  }
  
  await fetchPosts()
  await fetchCommunities()
})
</script>

<style scoped>
.forum-page {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 50%, #FFF0E0 100%);
  min-height: 100vh;
  padding-bottom: 100px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FF9800 100%);
  padding: 25px 0 0 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(255, 183, 77, 0.3);
  margin-bottom: 40px;
  min-height: 120px;
}

.hero-content {
  position: relative;
  z-index: 10;
  padding-bottom: 35px;
}

.hero-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.1rem;
  margin-top: 8px;
  margin-bottom: 0;
  font-weight: 400;
}

/* Wave Animation */
.wave-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  transform: rotate(180deg);
}

.wave-animation svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 35px;
}

.wave-animation .shape-fill {
  fill: #FFF5E6;
}

.content-container {
  margin-top: 10px;
  position: relative;
  z-index: 10;
}

/* Sidebar */
.sidebar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Browse Community Button */
.btn-browse-communities {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-browse-communities:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.btn-browse-communities i {
  font-size: 1.1rem;
}

/* Create Community Button */
.btn-create-community {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-create-community:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-create-community i {
  font-size: 1.1rem;
}

/* Search Card */
.search-card {
  background: white;
  width: 90%;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  margin-top: 0;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #FF9800;
  font-size: 1.1rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 15px 55px 15px 50px;
  border: 2px solid #E8DCC4;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #FFFBF5;
}

.search-input:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.clear-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px 10px;
  font-size: 1.2rem;
  transition: color 0.3s;
}

.clear-btn:hover {
  color: #FF9800;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #5D4E37;
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-chip {
  padding: 10px 20px;
  border: 2px solid #E8DCC4;
  border-radius: 50px;
  background: white;
  color: #7A7265;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: #FF9800;
  color: #FF9800;
  transform: translateY(-2px);
}

.filter-chip.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-color: #FF9800;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

/* Posts Grid */
.posts-grid {
  display: grid;
  gap: 25px;
}

.post-card {
  background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 100%);
  width: 90%;
  height: auto;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border: 2px solid rgba(255, 183, 77, 0.2);
  position: relative;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF9800 0%, #FFB74D 50%, #FF9800 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.post-card:hover::before {
  opacity: 1;
}

.post-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 15px 40px rgba(255, 152, 0, 0.25);
  border-color: #FFB74D;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFBF5 100%);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid rgba(255, 232, 214, 0.5);
  background: rgba(255, 245, 230, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 3px solid rgba(255, 183, 77, 0.2);
  box-shadow: 0 3px 10px rgba(255, 152, 0, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #5D4E37;
  font-size: 1rem;
}

.post-time {
  color: #999;
  font-size: 0.85rem;
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

.post-image-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE8D6 100%);
  border-bottom: 2px solid rgba(255, 232, 214, 0.5);
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
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.95) 0%, rgba(245, 124, 0, 0.95) 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.post-content {
  padding: 20px;
  background: linear-gradient(to bottom, transparent 0%, rgba(255, 245, 230, 0.2) 100%);
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
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  color: white;
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
  color:  #f0950b;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat i {
  color: #FF9800;
}

.view-btn {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.view-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #FFE0B2;
  border-top-color: #FF9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* FAB Button */
.fab-fixed {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(255, 152, 0, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-fixed:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 40px rgba(255, 152, 0, 0.6);
}

.fab-fixed:active {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .fab-fixed {
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    font-size: 1.3rem;
  }
}

/* Browse Communities Modal */
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
  z-index: 100000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 25px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 25px 30px;
  border-bottom: 2px solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.3s;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px 30px;
  overflow-y: auto;
  flex: 1;
}

.communities-list-modal {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.community-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 2px solid #FFE0B2;
  border-radius: 15px;
  transition: all 0.3s;
  background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 100%);
}

.community-card:hover {
  border-color: #FF9800;
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.15);
  transform: translateY(-2px);
}

.community-card-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.community-icon-large {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  flex-shrink: 0;
}

.community-details {
  flex: 1;
  min-width: 0;
}

.community-details h4 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #5D4E37;
}

.community-details p {
  margin: 0 0 10px 0;
  color: #7A7265;
  font-size: 0.95rem;
}

.community-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #999;
}

.community-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-join,
.btn-leave {
  padding: 12px 25px;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-join {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
}

.btn-join:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.btn-join:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-leave {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-leave:hover {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}

.btn-leave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state-modal {
  text-align: center;
  padding: 60px 20px;
}

.empty-state-modal i {
  font-size: 4rem;
  color: #FFB74D;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state-modal p {
  color: #7A7265;
  font-size: 1.1rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .wave-animation svg {
    height: 30px;
  }

  .sidebar-wrapper {
    gap: 10px;
  }

  .search-card {
    padding: 20px;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-chips {
    width: 100%;
  }

  .post-card {
    margin-bottom: 20px;
  }

  .modal-content {
    max-width: 100%;
    max-height: 90vh;
  }

  .community-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .btn-join,
  .btn-leave {
    width: 100%;
  }
}
</style>