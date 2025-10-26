<template>
  <div class="post-details-page">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-skeleton"></div>
      </div>

      <!-- Post Content -->
      <div v-else-if="currentPost" class="post-wrapper">
        <!-- Back Button -->
        <button class="back-btn" @click="navigateTo('/forum/main')">
          <i class="fas fa-arrow-left me-2"></i>Back to Forum
        </button>

        <!-- Main Post Card -->
        <div class="post-card">
          <!-- Image Carousel -->
          <div v-if="currentPost.image_urls?.length" class="carousel-container">
            <div class="main-image-wrapper">
              <img :src="currentPost.image_urls[currentCarouselIndex]" :alt="`Image ${currentCarouselIndex + 1}`"
                class="main-image" />

              <!-- Carousel Controls -->
              <button v-if="currentPost.image_urls.length > 1"
                @click="currentCarouselIndex = (currentCarouselIndex - 1 + currentPost.image_urls.length) % currentPost.image_urls.length"
                class="carousel-btn prev-btn"
                aria-label="Previous image">
                ‹
              </button>
              <button v-if="currentPost.image_urls.length > 1"
                @click="currentCarouselIndex = (currentCarouselIndex + 1) % currentPost.image_urls.length"
                class="carousel-btn next-btn"
                aria-label="Next image">
                ›
              </button>
            </div>

            <!-- Thumbnail Navigation -->
            <div v-if="currentPost.image_urls.length > 1" class="thumbnail-strip">
              <button v-for="(url, index) in currentPost.image_urls" :key="index" @click="currentCarouselIndex = index"
                :class="['thumbnail-btn', { active: currentCarouselIndex === index }]">
                <img :src="url" :alt="`Thumbnail ${index + 1}`" />
              </button>
            </div>
          </div>

          <!-- Post Header -->
          <div class="post-header">
            <div class="author-info">
              <div class="avatar-wrapper">
                <img :src="currentPost.users?.avatar_url || 'https://i.pravatar.cc/150'" :alt="currentPost.users?.name"
                  class="author-avatar" />
              </div>
              <div class="author-details">
                <h3 class="author-name">{{ currentPost.users?.name || 'Anonymous' }}</h3>
                <p class="post-date">
                  <i class="far fa-clock me-1"></i>
                  {{ formatDate(currentPost.created_at) }}
                </p>
              </div>
            </div>

            <div class="post-meta">
              <span :class="['type-badge', `type-${currentPost.post_type}`]">
                <i :class="getPostTypeIcon(currentPost.post_type)" class="me-2"></i>
                {{ currentPost.post_type }}
              </span>
            </div>
          </div>

          <!-- Post Body -->
          <div class="post-body">
            <h1 class="post-title">{{ currentPost.title }}</h1>

            <div class="post-content">
              {{ currentPost.content }}
            </div>

            <!-- Location -->
            <div v-if="currentPost.location_name" class="location-card" @click="showMapModal = true" role="button">
              <Teleport to=".post-details-page">
                <div v-if="showMapModal">
                  <div class="position-fixed top-50 start-50 translate-middle vw-100 vh-100 popupdiv" @click.self="() => {
                    showMapModal = false
                  }">
                    <PetMap :lat="currentPost.location_lat" :lng="currentPost.location_lng"
                      :passedDownClass="['w-50', 'h-50', 'm-auto']" />
                  </div>
                </div>
              </Teleport>
              <div class="location-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="location-details">
                <div class="location-label">Location</div>
                <div class="location-value">{{ currentPost.location_name }}</div>
              </div>
            </div>

            <!-- Adoption Section (Only for adoption posts) -->
            <div v-if="currentPost.post_type === 'adoption'" class="adoption-section">
              <button class="adopt-btn" @click="handleAdoptClick">
                <i class="fas fa-heart me-2"></i>
                Interested in Adopting
              </button>
              <p class="adoption-note">
                <i class="fas fa-info-circle me-1"></i>
                Click to contact the poster about adoption
              </p>
            </div>

            <!-- Tags -->
            <div v-if="currentPost.tags?.length" class="tags-section">
              <span v-for="tag in currentPost.tags" :key="tag" class="tag-item">
                #{{ tag }}
              </span>
            </div>

            <!-- Engagement Bar with Multiple Reactions -->
            <div class="engagement-bar">
              <div class="reactions-group">
                <!-- Heart Reaction -->
                <button @click="handleReaction('heart')" :class="['reaction-btn', { active: userReactions.heart }]">
                  <i :class="userReactions.heart ? 'fas fa-heart' : 'far fa-heart'"></i>
                  <span>{{ reactionCounts.heart || 0 }}</span>
                </button>

                <!-- Like Reaction (Thumbs Up) -->
                <button @click="handleReaction('like')" :class="['reaction-btn', { active: userReactions.like }]">
                  <i :class="userReactions.like ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'"></i>
                  <span>{{ reactionCounts.like || 0 }}</span>
                </button>

                <!-- Helpful Reaction (Star) -->
                <button @click="handleReaction('helpful')" :class="['reaction-btn', { active: userReactions.helpful }]">
                  <i :class="userReactions.helpful ? 'fas fa-star' : 'far fa-star'"></i>
                  <span>{{ reactionCounts.helpful || 0 }}</span>
                </button>
              </div>

              <div class="stats">
                <span class="stat-item">
                  <i class="far fa-eye me-1"></i>
                  {{ currentPost.view_count || 0 }} views
                </span>
                <span class="stat-item">
                  <i class="far fa-comment me-1"></i>
                  {{ comments.length }} comments
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h2 class="section-title">
            <i class="fas fa-comments me-2"></i>
            Comments ({{ comments.length }})
          </h2>

          <!-- Add Comment Form -->
          <div class="add-comment-card">
            <textarea v-model="newComment" placeholder="Share your thoughts..." rows="3"
              class="comment-textarea"></textarea>
            <button @click="handleAddComment" :disabled="!newComment.trim() || addingComment"
              class="submit-comment-btn">
              <i class="fas fa-paper-plane me-2"></i>
              {{ addingComment ? 'Posting...' : 'Post Comment' }}
            </button>
          </div>

          <!-- Comments List -->
          <div v-if="loadingComments" class="loading-comments">
            <div class="comment-skeleton"></div>
            <div class="comment-skeleton"></div>
          </div>

          <div v-else-if="topLevelComments.length" class="comments-list">
            <div v-for="comment in topLevelComments" :key="comment.id" class="comment-thread">
              <!-- Parent Comment -->
              <div class="comment-item">
                <img :src="comment.users?.avatar_url || 'https://i.pravatar.cc/150'" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.users?.name || 'Anonymous' }}</span>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>

                  <!-- Reply Button -->
                  <button class="reply-btn" @click="toggleReply(comment.id)">
                    <i class="fas fa-reply me-1"></i>
                    Reply
                  </button>

                  <!-- Reply Form -->
                  <div v-if="replyingTo === comment.id" class="reply-form">
                    <textarea v-model="replyContent" placeholder="Write a reply..." rows="2"
                      class="reply-textarea"></textarea>
                    <div class="reply-actions">
                      <button @click="cancelReply" class="cancel-reply-btn">
                        Cancel
                      </button>
                      <button @click="handleReply(comment.id)" :disabled="!replyContent.trim() || addingComment"
                        class="submit-reply-btn">
                        <i class="fas fa-paper-plane me-1"></i>
                        {{ addingComment ? 'Posting...' : 'Reply' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nested Replies -->
              <div v-if="getReplies(comment.id).length" class="replies-container">
                <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="reply-wrapper">
                  <div class="comment-item reply-item">
                    <img :src="reply.users?.avatar_url || 'https://i.pravatar.cc/150'" class="comment-avatar" />
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-author">{{ reply.users?.name || 'Anonymous'
                          }}</span>
                        <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
                      </div>
                      <p class="comment-text">{{ reply.content }}</p>

                      <!-- Reply Button on Replies -->
                      <button class="reply-btn" @click="toggleReply(reply.id)">
                        <i class="fas fa-reply me-1"></i>
                        Reply
                      </button>

                      <!-- Reply Form on Replies -->
                      <div v-if="replyingTo === reply.id" class="reply-form">
                        <textarea v-model="replyContent" placeholder="Write a reply..." rows="2"
                          class="reply-textarea"></textarea>
                        <div class="reply-actions">
                          <button @click="cancelReply" class="cancel-reply-btn">
                            Cancel
                          </button>
                          <button @click="handleReply(reply.id)" :disabled="!replyContent.trim() || addingComment"
                            class="submit-reply-btn">
                            <i class="fas fa-paper-plane me-1"></i>
                            {{ addingComment ? 'Posting...' : 'Reply' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Show nested replies to this reply -->
                  <div v-if="getReplies(reply.id).length" class="nested-replies">
                    <div v-for="nestedReply in getReplies(reply.id)" :key="nestedReply.id"
                      class="comment-item reply-item nested-reply-item">
                      <img :src="nestedReply.users?.avatar_url || 'https://i.pravatar.cc/150'"
                        class="comment-avatar small-avatar" />
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-author">{{ nestedReply.users?.name ||
                            'Anonymous' }}</span>
                          <span class="comment-date">{{ formatDate(nestedReply.created_at)
                            }}</span>
                        </div>
                        <p class="comment-text">{{ nestedReply.content }}</p>

                        <!-- Can also reply to nested replies -->
                        <button class="reply-btn small-reply-btn" @click="toggleReply(nestedReply.id)">
                          <i class="fas fa-reply me-1"></i>
                          Reply
                        </button>

                        <div v-if="replyingTo === nestedReply.id" class="reply-form">
                          <textarea v-model="replyContent" placeholder="Write a reply..." rows="2"
                            class="reply-textarea"></textarea>
                          <div class="reply-actions">
                            <button @click="cancelReply" class="cancel-reply-btn">
                              Cancel
                            </button>
                            <button @click="handleReply(nestedReply.id)"
                              :disabled="!replyContent.trim() || addingComment" class="submit-reply-btn">
                              <i class="fas fa-paper-plane me-1"></i>
                              {{ addingComment ? 'Posting...' : 'Reply' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-comments">
            <i class="fas fa-comment-slash"></i>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist or has been removed.</p>
        <button class="back-home-btn" @click="navigateTo('/forum/main')">
          <i class="fas fa-home me-2"></i>
          Back to Forum
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PetMap from '@/components/PetMap.vue'

// Add Font Awesome to page head
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      crossorigin: 'anonymous'
    }
  ]
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// API Base URL
const API_BASE = config.public.apiBase || 'http://localhost:3000/api'

// State
const currentPost = ref(null)
const comments = ref([])
const loading = ref(true)
const loadingComments = ref(true)
const currentCarouselIndex = ref(0)
const newComment = ref('')
const addingComment = ref(false)
const replyingTo = ref(null)
const replyContent = ref('')
const showMapModal = ref(false)

// Get current user from localStorage or session
const getCurrentUser = () => {
  if (process.client) {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}

// Reaction state - now tracking multiple reaction types
const userReactions = ref({
  heart: false,
  like: false,
  helpful: false
})
const reactionCounts = ref({
  heart: 0,
  like: 0,
  helpful: 0
})

// Computed
const topLevelComments = computed(() => {
  return comments.value.filter(comment => !comment.parent_comment_id)
})

const getReplies = (parentId) => {
  return comments.value.filter(comment => comment.parent_comment_id === parentId)
}

// Methods
const navigateTo = (path) => {
  router.push(path)
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

const getPostTypeIcon = (type) => {
  const icons = {
    general: 'fas fa-comment-dots',
    adoption: 'fas fa-heart',
    'lost & found': 'fas fa-search',
    tips: 'fas fa-lightbulb',
    question: 'fas fa-question-circle'
  }
  return icons[type] || 'fas fa-comment-dots'
}

const fetchPost = async () => {
  try {
    loading.value = true
    const postId = route.params.postId

    const response = await fetch(`${API_BASE}/forum/posts/${postId}`)
    
    if (!response.ok) throw new Error('Failed to fetch post')

    const data = await response.json()
    currentPost.value = data
    
    // Fetch all reaction counts
    await fetchReactionCounts()
    await checkUserReactions()
    await incrementViewCount()
  } catch (error) {
    console.error('Error fetching post:', error)
    currentPost.value = null
  } finally {
    loading.value = false
  }
}

const fetchReactionCounts = async () => {
  try {
    const postId = route.params.postId
    
    // Fetch counts for each reaction type
    const reactionTypes = ['heart', 'like', 'helpful']
    
    for (const type of reactionTypes) {
      const response = await fetch(
        `${API_BASE}/forum/posts/${postId}/reactions?type=${type}`
      )
      
      if (response.ok) {
        const data = await response.json()
        reactionCounts.value[type] = data.count || 0
      }
    }
  } catch (error) {
    console.error('Error fetching reaction counts:', error)
  }
}

const checkUserReactions = async () => {
  try {
    const user = getCurrentUser()
    if (!user) return

    const postId = route.params.postId
    
    const response = await fetch(
      `${API_BASE}/forum/posts/${postId}/reactions/user/${user.id}`
    )
    
    if (!response.ok) return

    const data = await response.json()

    // Reset all reactions first
    userReactions.value = {
      heart: false,
      like: false,
      helpful: false
    }

    // Set reactions that user has made
    if (data && Array.isArray(data)) {
      data.forEach(reaction => {
        if (reaction.reaction_type) {
          userReactions.value[reaction.reaction_type] = true
        }
      })
    }
  } catch (error) {
    console.error('Error checking user reactions:', error)
  }
}

const handleReaction = async (reactionType) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      alert('Please sign in to react to posts')
      return
    }

    const postId = route.params.postId
    const hasReacted = userReactions.value[reactionType]

    const response = await fetch(`${API_BASE}/forum/posts/${postId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        reaction_type: reactionType
      })
    })

    if (!response.ok) throw new Error('Failed to toggle reaction')

    const result = await response.json()

    if (result.action === 'removed') {
      userReactions.value[reactionType] = false
      reactionCounts.value[reactionType]--
    } else {
      userReactions.value[reactionType] = true
      reactionCounts.value[reactionType]++
    }
  } catch (error) {
    console.error('Error handling reaction:', error)
    alert('Failed to update reaction. Please try again.')
  }
}

const incrementViewCount = async () => {
  try {
    const postId = route.params.postId
    await fetch(`${API_BASE}/forum/posts/${postId}/view`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }
}

const fetchComments = async () => {
  try {
    loadingComments.value = true
    const postId = route.params.postId

    const response = await fetch(`${API_BASE}/forum/posts/${postId}/comments`)
    
    if (!response.ok) throw new Error('Failed to fetch comments')

    const data = await response.json()
    comments.value = data || []
  } catch (error) {
    console.error('Error fetching comments:', error)
  } finally {
    loadingComments.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  try {
    addingComment.value = true
    const user = getCurrentUser()

    if (!user) {
      alert('Please sign in to comment')
      return
    }

    const postId = route.params.postId

    const response = await fetch(`${API_BASE}/forum/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        content: newComment.value.trim(),
        parent_comment_id: null
      })
    })

    if (!response.ok) throw new Error('Failed to add comment')

    const data = await response.json()
    comments.value.push(data)
    newComment.value = ''
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Failed to add comment. Please try again.')
  } finally {
    addingComment.value = false
  }
}

const toggleReply = (commentId) => {
  if (replyingTo.value === commentId) {
    replyingTo.value = null
    replyContent.value = ''
  } else {
    replyingTo.value = commentId
    replyContent.value = ''
  }
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const handleReply = async (parentCommentId) => {
  if (!replyContent.value.trim()) return

  try {
    addingComment.value = true
    const user = getCurrentUser()

    if (!user) {
      alert('Please sign in to reply')
      return
    }

    const postId = route.params.postId

    const response = await fetch(`${API_BASE}/forum/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        content: replyContent.value.trim(),
        parent_comment_id: parentCommentId
      })
    })

    if (!response.ok) throw new Error('Failed to add reply')

    const data = await response.json()
    comments.value.push(data)
    replyContent.value = ''
    replyingTo.value = null
  } catch (error) {
    console.error('Error adding reply:', error)
    alert('Failed to add reply. Please try again.')
  } finally {
    addingComment.value = false
  }
}

const handleAdoptClick = async () => {
  try {
    const user = getCurrentUser()
    
    if (!user) {
      alert('Please sign in to express interest in adoption')
      return
    }

    // Show confirmation alert
    alert(`Thank you for your interest in adopting! You will now be redirected to the Adoption Checklist to help you prepare.
    Poster Contact: ${currentPost.value.users?.name}`)
    
    // Redirect to checklist page
    router.push('/checklist/checklistmain')
    
    // Future enhancement: Integrate Twilio SMS notification
    // sendSMSNotification(currentPost.value.user_id, user.id)
  } catch (error) {
    console.error('Error handling adoption interest:', error)
    alert('Failed to process your request. Please try again.')
  }
}

// Lifecycle
onMounted(() => {
  fetchPost()
  fetchComments()
})

watch(() => route.params.postId, () => {
  if (route.params.postId) {
    currentCarouselIndex.value = 0
    fetchPost()
    fetchComments()
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

.post-details-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFEFD5 0%, #FFE4B5 50%, #FFDAB9 100%);
  padding: 40px 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 30px;
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(255, 155, 133, 0.3);
}

.back-btn:hover {
  background: linear-gradient(135deg, #FFB88C 0%, #FFC8A8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 155, 133, 0.4);
}

.post-card {
  background: white;
  border-radius: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease;
}

.carousel-container {
  width: 100%;
  background: #f8f8f8;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, rgba(255, 155, 133, 0.95) 0%, rgba(255, 184, 140, 0.95) 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  font-weight: bold;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(255, 155, 133, 0.4);
}

.carousel-btn:hover {
  background: linear-gradient(135deg, rgba(255, 184, 140, 0.98) 0%, rgba(255, 200, 168, 0.98) 100%);
  transform: translateY(-50%) scale(1.15);
  box-shadow: 0 6px 25px rgba(255, 155, 133, 0.5);
  border-color: white;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.thumbnail-strip {
  display: flex;
  gap: 10px;
  padding: 15px;
  overflow-x: auto;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.thumbnail-strip::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-strip::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.thumbnail-strip::-webkit-scrollbar-thumb {
  background: #FFB88C;
  border-radius: 10px;
}

.thumbnail-btn {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 3px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
  background: none;
}

.thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-btn.active {
  border-color: #FF9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
}

.thumbnail-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.post-header {
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #f5f5f5;
}

.author-info {
  display: flex;
  gap: 15px;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FFB88C;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.author-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #5D4E37;
  margin: 0;
}

.post-date {
  color: #7A7265;
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
}

.type-badge {
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
}

.type-general {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  color: #1976D2;
}

.type-adoption {
  background: linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%);
  color: #C2185B;
}

.type-lost,
.type-found {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  color: #F57C00;
}

.type-tips {
  background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
  color: #7B1FA2;
}

.type-question {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  color: #388E3C;
}

.post-body {
  padding: 30px;
}

.post-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 20px;
  line-height: 1.3;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4A4A4A;
  margin-bottom: 30px;
  white-space: pre-wrap;
}

.location-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
  border-radius: 15px;
  border: 2px solid #FFE082;
  margin-bottom: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.location-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.2);
  border-color: #FFD54F;
}

.location-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #FFC107 0%, #FFB300 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.location-details {
  flex: 1;
}

.location-label {
  font-size: 0.85rem;
  color: #F57C00;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.location-value {
  font-size: 1.1rem;
  color: #5D4E37;
  font-weight: 600;
}

/* Adoption Section Styles */
.adoption-section {
  padding: 25px;
  background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F0 100%);
  border-radius: 15px;
  border: 2px solid #FFB3BA;
  margin-bottom: 25px;
  text-align: center;
}

.adopt-btn {
  background: linear-gradient(135deg, #FF6B9D 0%, #C2185B 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 5px 20px rgba(255, 107, 157, 0.3);
  margin-bottom: 10px;
}

.adopt-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(255, 107, 157, 0.4);
  background: linear-gradient(135deg, #FF5A8F 0%, #AD1457 100%);
}

.adopt-btn:active {
  transform: translateY(-1px);
}

.adoption-note {
  color: #C2185B;
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.tag-item {
  padding: 8px 18px;
  background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
  color: #7B1FA2;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(123, 31, 162, 0.2);
}

.engagement-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 25px;
  border-top: 2px solid #f5f5f5;
  gap: 20px;
}

.reactions-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  border: 2px solid #FFB74D;
  border-radius: 25px;
  color: #F57C00;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.reaction-btn i {
  font-size: 1.2rem;
}

.reaction-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.2);
  border-color: #FF9800;
}

.reaction-btn.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-color: #FF9800;
}

.reaction-btn.active i {
  animation: heartbeat 0.5s ease;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

.stats {
  display: flex;
  gap: 25px;
  align-items: center;
}

.stat-item {
  color: #7A7265;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

.comments-section {
  background: white;
  border-radius: 25px;
  padding: 35px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.8s ease 0.2s both;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.add-comment-card {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFAF5 100%);
  padding: 25px;
  border-radius: 20px;
  margin-bottom: 30px;
  border: 2px solid #FFE0B2;
}

.comment-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #FFB74D;
  border-radius: 15px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.submit-comment-btn {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.submit-comment-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);
}

.submit-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.comment-thread {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #FFFEF7 0%, #FFF9F0 100%);
  border-radius: 15px;
  border-left: 4px solid #FFB88C;
  transition: all 0.3s;
  animation: slideIn 0.5s ease;
}

.comment-item:hover {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transform: translateX(5px);
}

.comment-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FFB88C;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.comment-author {
  font-weight: 700;
  color: #5D4E37;
  font-size: 1rem;
}

.comment-date {
  color: #999;
  font-size: 0.85rem;
}

.comment-text {
  color: #4A4A4A;
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.reply-btn {
  background: none;
  border: none;
  color: #FF9800;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 15px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.reply-btn:hover {
  background: rgba(255, 152, 0, 0.1);
  color: #F57C00;
}

.replies-container {
  margin-left: 65px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  padding-left: 25px;
  border-left: 3px solid rgba(255, 184, 140, 0.3);
}

.reply-item {
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%);
  border-left-color: #FFC107;
}

.reply-form {
  margin-top: 15px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #FFE0B2;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #FFB74D;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.reply-textarea:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.reply-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-reply-btn {
  padding: 8px 20px;
  background: rgba(122, 114, 101, 0.1);
  color: #7A7265;
  border: 2px solid rgba(122, 114, 101, 0.2);
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-reply-btn:hover {
  background: #7A7265;
  color: white;
}

.submit-reply-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
}

.submit-reply-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.submit-reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reply-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.nested-replies {
  margin-left: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  padding-left: 20px;
  border-left: 2px solid rgba(255, 183, 77, 0.3);
}

.nested-reply-item {
  background: linear-gradient(135deg, #FFF5E6 0%, #FFFAF0 100%);
  border-left: 3px solid #F57C00;
  padding: 15px;
}

.small-avatar {
  width: 40px;
  height: 40px;
}

.small-reply-btn {
  font-size: 0.85rem;
  padding: 6px 14px;
}

.no-comments {
  text-align: center;
  padding: 60px 20px;
  color: #7A7265;
}

.no-comments i {
  font-size: 4rem;
  color: #FFB88C;
  margin-bottom: 15px;
}

.no-comments p {
  font-size: 1.1rem;
  margin: 0;
}

.loading-skeleton,
.comment-skeleton {
  height: 300px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 20px;
  margin-bottom: 20px;
}

.comment-skeleton {
  height: 100px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.error-state {
  text-align: center;
  padding: 80px 20px;
  animation: fadeIn 0.8s ease;
}

.error-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  background: linear-gradient(135deg, #FFB88C 0%, #FF9B85 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon i {
  font-size: 4rem;
  color: white;
}

.error-state h2 {
  font-size: 2rem;
  color: #5D4E37;
  margin-bottom: 15px;
}

.error-state p {
  color: #7A7265;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.back-home-btn {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.back-home-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 155, 133, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .main-image-wrapper {
    height: 300px;
  }

  .post-title {
    font-size: 1.8rem;
  }

  .post-header {
    flex-direction: column;
    gap: 20px;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .engagement-bar {
    flex-direction: column;
    gap: 15px;
  }

  .reactions-group {
    flex-wrap: wrap;
    justify-content: center;
  }

  .reaction-btn {
    font-size: 0.85rem;
    padding: 8px 14px;
  }

  .comment-item {
    flex-direction: column;
  }

  .nested-replies {
    margin-left: 20px;
    padding-left: 10px;
  }

  .replies-container {
    margin-left: 30px;
  }

  .small-avatar {
    width: 35px;
    height: 35px;
  }
  
  .adopt-btn {
    font-size: 1rem;
    padding: 12px 30px;
  }
}

.popupdiv {
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>