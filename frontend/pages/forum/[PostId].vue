<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
    <div class="container mx-auto px-4 max-w-5xl">
      <!-- Back Button -->
      <UButton
        variant="ghost"
        icon="i-heroicons-arrow-left"
        @click="navigateTo('/forum')"
        class="mb-6"
      >
        Back to Forum
      </UButton>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <USkeleton class="h-96" />
        <USkeleton class="h-64" />
      </div>

      <!-- Post Content -->
      <div v-else-if="currentPost" class="space-y-6">
        <!-- Main Post Card -->
        <UCard class="shadow-xl">
          <!-- Image Carousel -->
          <div v-if="currentPost.image_urls?.length" class="relative -mx-6 -mt-6 mb-6">
            <div class="relative h-96 bg-gray-900 rounded-t-xl overflow-hidden">
              <!-- Main Image -->
              <img
                :src="currentPost.image_urls[currentCarouselIndex]"
                :alt="currentPost.title"
                class="w-full h-full object-contain"
              />

              <!-- Navigation Arrows -->
              <button
                v-if="currentPost.image_urls.length > 1"
                @click="previousImage"
                class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
              >
                <UIcon name="i-heroicons-chevron-left" class="w-6 h-6" />
              </button>
              <button
                v-if="currentPost.image_urls.length > 1"
                @click="nextImage"
                class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
              >
                <UIcon name="i-heroicons-chevron-right" class="w-6 h-6" />
              </button>

              <!-- Image Counter -->
              <div class="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {{ currentCarouselIndex + 1 }} / {{ currentPost.image_urls.length }}
              </div>
            </div>

            <!-- Thumbnail Strip -->
            <div v-if="currentPost.image_urls.length > 1" class="flex gap-2 p-4 bg-gray-100 dark:bg-gray-800 overflow-x-auto">
              <button
                v-for="(url, index) in currentPost.image_urls"
                :key="index"
                @click="currentCarouselIndex = index"
                :class="[
                  'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                  currentCarouselIndex === index 
                    ? 'border-blue-500 scale-105' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                ]"
              >
                <img :src="url" :alt="`Image ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Post Header -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-4">
              <UAvatar
                :src="currentPost.users?.avatar_url"
                :alt="currentPost.users?.name"
                size="xl"
              />
              <div>
                <p class="font-bold text-xl text-gray-900 dark:text-white">
                  {{ currentPost.users?.name || 'Anonymous' }}
                </p>
                <p class="text-sm text-gray-500">
                  Posted {{ formatDate(currentPost.created_at) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <UBadge
                :color="getPostTypeColor(currentPost.post_type)"
                variant="subtle"
                size="lg"
              >
                {{ currentPost.post_type }}
              </UBadge>
              
              <UButton
                v-if="isAuthor"
                icon="i-heroicons-pencil"
                variant="ghost"
                @click="navigateTo(`/forum/${currentPost.id}/editPost`)"
              >
                Edit
              </UButton>
            </div>
          </div>

          <!-- Post Body -->
          <div class="space-y-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ currentPost.title }}
            </h1>

            <p class="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {{ currentPost.content }}
            </p>

            <!-- Location -->
            <div
              v-if="currentPost.location_name"
              class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
            >
              <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-red-500" />
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">Location</div>
                <div class="text-gray-600 dark:text-gray-400">{{ currentPost.location_name }}</div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="currentPost.tags?.length" class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in currentPost.tags"
                :key="tag"
                color="blue"
                variant="soft"
                size="lg"
              >
                #{{ tag }}
              </UBadge>
            </div>
          </div>

          <!-- Post Footer -->
          <template #footer>
            <div class="flex items-center justify-between py-4">
              <!-- Stats -->
              <div class="flex items-center gap-6 text-gray-600">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-eye" class="w-5 h-5" />
                  <span class="font-semibold">{{ currentPost.view_count || 0 }}</span>
                  <span class="text-sm">views</span>
                </div>

                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-chat-bubble-left" class="w-5 h-5" />
                  <span class="font-semibold">{{ comments.length }}</span>
                  <span class="text-sm">comments</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-3">
                <UButton
                  :icon="hasLiked ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                  :color="hasLiked ? 'red' : 'gray'"
                  variant="soft"
                  size="lg"
                  @click="handleReaction"
                >
                  {{ reactionCount }}
                </UButton>

                <UButton
                  v-if="isAuthor && !currentPost.is_resolved"
                  color="green"
                  variant="soft"
                  size="lg"
                  @click="markAsResolved"
                >
                  Mark Resolved
                </UButton>
              </div>
            </div>

            <!-- Resolved Alert -->
            <UAlert
              v-if="currentPost.is_resolved"
              color="green"
              variant="subtle"
              title="This post has been marked as resolved"
              icon="i-heroicons-check-circle"
              class="mt-4"
            />
          </template>
        </UCard>

        <!-- Comments Section -->
        <UCard class="shadow-xl">
          <template #header>
            <h2 class="text-2xl font-bold">Comments ({{ comments.length }})</h2>
          </template>

          <div class="space-y-6">
            <!-- Add Comment Form -->
            <div class="pb-6 border-b border-gray-200 dark:border-gray-700">
              <UTextarea
                v-model="newComment"
                placeholder="Write a comment..."
                :rows="3"
                class="mb-3"
              />
              <div class="flex justify-end">
                <UButton
                  color="primary"
                  icon="i-heroicons-paper-airplane"
                  @click="handleAddComment"
                  :disabled="!newComment.trim()"
                  :loading="addingComment"
                >
                  Post Comment
                </UButton>
              </div>
            </div>

            <!-- Comments List -->
            <div v-if="loadingComments" class="space-y-4">
              <USkeleton v-for="i in 3" :key="i" class="h-24" />
            </div>

            <div v-else-if="comments.length > 0" class="space-y-4">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
              >
                <UAvatar
                  :src="comment.users?.avatar_url"
                  :alt="comment.users?.name"
                  size="md"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ comment.users?.name || 'Anonymous' }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(comment.created_at) }}
                    </span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300">
                    {{ comment.content }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <UIcon name="i-heroicons-chat-bubble-left" class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-20">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-24 h-24 mx-auto mb-4 text-red-400" />
        <h2 class="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">Post not found</h2>
        <p class="text-gray-500 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <UButton color="primary" size="lg" @click="navigateTo('/forum')">
          Back to Forum
        </UButton>
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
  incrementViewCount,
  updatePost
} = useForum()

const comments = ref([])
const loadingComments = ref(false)
const hasLiked = ref(false)
const reactionCount = ref(0)
const newComment = ref('')
const addingComment = ref(false)
const currentCarouselIndex = ref(0)

// Mock current user - replace with actual auth
const currentUserId = 'current-user-id'

const isAuthor = computed(() => {
  return currentPost.value?.user_id === currentUserId
})

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

const getPostTypeColor = (type) => {
  const colors = {
    adoption: 'blue',
    sighting: 'yellow',
    lost: 'red',
    found: 'green',
    discussion: 'purple',
    update: 'gray'
  }
  return colors[type] || 'gray'
}

const loadComments = async () => {
  loadingComments.value = true
  try {
    comments.value = await fetchComments(route.params.postId)
  } finally {
    loadingComments.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return
  
  addingComment.value = true
  try {
    const result = await addComment(route.params.postId, {
      content: newComment.value,
      user_id: currentUserId
    })

    if (result) {
      newComment.value = ''
      await loadComments()
    }
  } finally {
    addingComment.value = false
  }
}

const handleReaction = async () => {
  await toggleReaction(route.params.postId, 'like')
  hasLiked.value = !hasLiked.value
  reactionCount.value += hasLiked.value ? 1 : -1
}

const markAsResolved = async () => {
  await updatePost(route.params.postId, { is_resolved: true })
  if (currentPost.value) {
    currentPost.value.is_resolved = true
  }
}

const previousImage = () => {
  if (!currentPost.value?.image_urls?.length) return
  currentCarouselIndex.value = 
    (currentCarouselIndex.value - 1 + currentPost.value.image_urls.length) % 
    currentPost.value.image_urls.length
}

const nextImage = () => {
  if (!currentPost.value?.image_urls?.length) return
  currentCarouselIndex.value = 
    (currentCarouselIndex.value + 1) % currentPost.value.image_urls.length
}

onMounted(async () => {
  const postId = route.params.postId
  await fetchPostById(postId)
  await loadComments()
  await incrementViewCount(postId)
})
</script>