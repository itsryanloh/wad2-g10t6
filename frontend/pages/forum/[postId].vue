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
                class="carousel-btn prev-btn">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button v-if="currentPost.image_urls.length > 1"
                @click="currentCarouselIndex = (currentCarouselIndex + 1) % currentPost.image_urls.length"
                class="carousel-btn next-btn">
                <i class="fas fa-chevron-right"></i>
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

            <!-- Tags -->
            <div v-if="currentPost.tags?.length" class="tags-section">
              <span v-for="tag in currentPost.tags" :key="tag" class="tag-item">
                #{{ tag }}
              </span>
            </div>

            <!-- Engagement Bar -->
            <div class="engagement-bar">
              <button @click="handleReaction" :class="['reaction-btn', { active: hasLiked }]">
                <i :class="hasLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
                <span>{{ reactionCount }}</span>
              </button>

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
            <i class="far fa-comment-dots"></i>
            <p>Be the first to comment!</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Post not found</h2>
        <p>The post you're looking for doesn't exist or has been removed.</p>
        <button class="back-home-btn" @click="navigateTo('/forum')">
          <i class="fas fa-home me-2"></i>Back to Forum
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useForum } from '~/composables/useForum'

const route = useRoute()
const {
  currentPost,
  loading,
  fetchPostById,
  fetchComments,
  addComment,
  toggleReaction,
  incrementViewCount
} = useForum()

const showMapModal = ref(false)
const comments = ref([])
const loadingComments = ref(false)
const hasLiked = ref(false)
const reactionCount = ref(0)
const newComment = ref('')
const addingComment = ref(false)
const currentCarouselIndex = ref(0)
const replyingTo = ref(null)
const replyContent = ref('')
const currentUserId = ref(null)
const base_url = import.meta.env.VITE_BASE_URL;

const isAuthor = computed(() => {
  return currentPost.value?.user_id === currentUserId.value
})

// Get top-level comments (no parent)
const topLevelComments = computed(() => {
  return comments.value.filter(c => !c.parent_comment_id)
})

// Get replies for a specific comment
const getReplies = (commentId) => {
  return comments.value.filter(c => c.parent_comment_id === commentId)
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

  if (!currentUserId.value) {
    alert('User not loaded. Please refresh the page.')
    return
  }

  addingComment.value = true
  try {
    console.log('Adding reply to comment:', parentCommentId)

    const result = await addComment(route.params.postId, {
      content: replyContent.value,
      user_id: currentUserId.value,
      parent_comment_id: parentCommentId
    })

    console.log('Reply result:', result)

    if (result) {
      replyContent.value = ''
      replyingTo.value = null
      await loadComments()
    } else {
      console.error('Failed to add reply')
      alert('Failed to post reply. Please try again.')
    }
  } catch (error) {
    console.error('Error adding reply:', error)
    alert('Error posting reply. Check console for details.')
  } finally {
    addingComment.value = false
  }
}

const formatDate = (date) => {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor((now - postDate) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getPostTypeIcon = (type) => {
  const icons = {
    adoption: 'fas fa-heart',
    sighting: 'fas fa-eye',
    lost: 'fas fa-exclamation-triangle',
    found: 'fas fa-check-circle',
    discussion: 'fas fa-comments',
    update: 'fas fa-sync'
  }
  return icons[type] || 'fas fa-circle'
}

const loadComments = async () => {
  loadingComments.value = true
  try {
    console.log('Loading comments for post:', route.params.postId)
    const result = await fetchComments(route.params.postId)
    console.log('Comments loaded:', result)
    comments.value = result || []
  } catch (error) {
    console.error('Error loading comments:', error)
    comments.value = []
  } finally {
    loadingComments.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  if (!currentUserId.value) {
    alert('User not loaded. Please refresh the page.')
    return
  }

  addingComment.value = true
  try {
    console.log('Adding comment to post:', route.params.postId)
    console.log('Comment content:', newComment.value)
    console.log('User ID:', currentUserId.value)

    const result = await addComment(route.params.postId, {
      content: newComment.value,
      user_id: currentUserId.value
    })

    console.log('Comment result:', result)

    if (result) {
      newComment.value = ''
      await loadComments()
    } else {
      console.error('Failed to add comment')
      alert('Failed to post comment. Please try again.')
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Error posting comment. Check console for details.')
  } finally {
    addingComment.value = false
  }
}

const handleReaction = async () => {
  if (!currentUserId.value) {
    alert('User not loaded. Please refresh the page.')
    return
  }

  try {
    console.log('Toggling reaction for post:', route.params.postId)
    const result = await toggleReaction(route.params.postId, currentUserId.value, 'like')
    console.log('Reaction result:', result)

    hasLiked.value = !hasLiked.value
    reactionCount.value += hasLiked.value ? 1 : -1
  } catch (error) {
    console.error('Error toggling reaction:', error)
  }
}

const loadCurrentUser = async () => {
  try {
    const response = await fetch(`${base_url}/users`)
    const users = await response.json()

    // Find David Chen or use first user
    const davidChen = users.find(user =>
      user.username === 'davidchen' || user.name.toLowerCase().includes('david chen')
    )

    const targetUser = davidChen || users[0]

    if (targetUser) {
      currentUserId.value = targetUser.id
      console.log('Current user loaded:', targetUser.name, targetUser.id)
    } else {
      console.error('No users found in database')
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  }
}

onMounted(async () => {
  console.log('Post page mounted with ID:', route.params.postId)

  await loadCurrentUser()
  await fetchPostById(route.params.postId)
  await loadComments()
  await incrementViewCount(route.params.postId)

  if (currentPost.value) {
    reactionCount.value = currentPost.value.reaction_count || 0
    console.log('Post loaded:', currentPost.value)
  }
})
</script>

<style scoped>
.post-details-page {
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE4E1 50%, #E6F3FF 100%);
  min-height: 100vh;
  padding: 40px 0 80px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-btn {
  background: rgba(255, 155, 133, 0.15);
  color: #FF9B85;
  border: 2px solid rgba(255, 155, 133, 0.3);
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
  margin-bottom: 30px;
  cursor: pointer;
}

.back-btn:hover {
  background: #FF9B85;
  color: white;
  transform: translateX(-5px);
  box-shadow: 0 5px 20px rgba(255, 155, 133, 0.3);
}

.post-card {
  background: white;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  animation: slideUp 0.6s ease;
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

.carousel-container {
  position: relative;
}

.main-image-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE4E1 100%);
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
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  color: #FF9B85;
  font-size: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.carousel-btn:hover {
  background: #FF9B85;
  color: white;
  transform: translateY(-50%) scale(1.1);
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
  background: linear-gradient(135deg, #FFF4E6 0%, #ffffff 100%);
  overflow-x: auto;
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
  opacity: 0.6;
}

.thumbnail-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

.thumbnail-btn.active {
  border-color: #FF9B85;
  opacity: 1;
  box-shadow: 0 5px 15px rgba(255, 155, 133, 0.3);
}

.thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
  border-bottom: 2px solid #FFF4E6;
}

.author-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #FFB88C;
  box-shadow: 0 5px 15px rgba(255, 155, 133, 0.2);
}

.author-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.post-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.type-badge {
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-adoption {
  background: linear-gradient(135deg, #FFB88C 0%, #FF9B85 100%);
  color: white;
}

.type-sighting {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
}

.type-lost {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  color: white;
}

.type-found {
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8F7 100%);
  color: white;
}

.type-discussion {
  background: linear-gradient(135deg, #B8A4E8 0%, #9B7FD4 100%);
  color: white;
}

.post-body {
  padding: 30px;
}

.post-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #5D4E37;
  margin-bottom: 20px;
  line-height: 1.3;
}

.post-content {
  font-size: 1.1rem;
  color: #7A7265;
  line-height: 1.8;
  margin-bottom: 30px;
  white-space: pre-wrap;
}

.location-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #FFE4E1 0%, #FFF4E6 100%);
  border-radius: 15px;
  border-left: 5px solid #FF9B85;
  margin-bottom: 25px;
}

.location-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.location-details {
  flex: 1;
}

.location-label {
  font-weight: 700;
  color: #5D4E37;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.location-value {
  color: #7A7265;
  font-size: 1.1rem;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.tag-item {
  padding: 8px 18px;
  background: linear-gradient(135deg, #88D8F7 0%, #A8E6CF 100%);
  color: white;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(136, 216, 247, 0.3);
}

.engagement-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #FFF4E6 0%, #ffffff 100%);
  border-radius: 15px;
  margin-top: 30px;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 25px;
  background: white;
  border: 2px solid #FFB88C;
  border-radius: 50px;
  color: #FF9B85;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.reaction-btn:hover {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 155, 133, 0.3);
}

.reaction-btn.active {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
}

.reaction-btn i {
  font-size: 1.2rem;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  color: #7A7265;
  font-size: 0.95rem;
  font-weight: 500;
}

.comments-section {
  background: white;
  border-radius: 25px;
  padding: 30px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.6s ease 0.2s backwards;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 25px;
}

.add-comment-card {
  background: linear-gradient(135deg, #FFF4E6 0%, #FFE4E1 100%);
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.comment-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #FFB88C;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.comment-textarea:focus {
  outline: none;
  border-color: #FF9B85;
  box-shadow: 0 0 0 4px rgba(255, 155, 133, 0.1);
}

.submit-comment-btn {
  background: linear-gradient(135deg, #FF9B85 0%, #FFB88C 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-comment-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 155, 133, 0.4);
}

.submit-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #FFF4E6 0%, #ffffff 100%);
  border-radius: 15px;
  transition: all 0.3s;
}

.comment-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
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
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 700;
  color: #5D4E37;
}

.comment-date {
  font-size: 0.85rem;
  color: #7A7265;
}

.comment-text {
  color: #7A7265;
  line-height: 1.6;
  margin: 0;
}

.reply-btn {
  background: rgba(255, 152, 0, 0.1);
  border: 2px solid rgba(255, 152, 0, 0.3);
  color: #FF9800;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
}

.reply-btn:hover {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

.comment-thread {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reply-item {
  background: linear-gradient(135deg, #FFE8D6 0%, #FFF5E6 100%);
  border-left: 3px solid #FF9800;
}

.replies-container {
  margin-left: 60px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
}

.replies-container::before {
  content: '';
  position: absolute;
  left: -30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #FFB74D, transparent);
}

.reply-form {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  border: 2px solid #FFB74D;
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
}

.popupdiv {
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
