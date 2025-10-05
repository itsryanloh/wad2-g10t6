<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
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
    <div v-if="loading">
      <USkeleton class="h-64 mb-6" />
      <USkeleton class="h-32" />
    </div>

    <!-- Post Content -->
    <div v-else-if="currentPost">
      <UCard class="mb-6">
        <!-- Post Header -->
        <template #header>
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <UAvatar
                :src="currentPost.users?.avatar_url"
                :alt="currentPost.users?.name"
                size="lg"
              />
              <div>
                <p class="font-semibold text-lg">
                  {{ currentPost.users?.name || 'Anonymous' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(currentPost.created_at) }}
                </p>
              </div>
            </div>

            <UBadge
              :color="getPostTypeColor(currentPost.post_type)"
              variant="subtle"
              size="lg"
            >
              {{ currentPost.post_type }}
            </UBadge>
          </div>
        </template>

        <!-- Post Body -->
        <div class="space-y-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ currentPost.title }}
          </h1>

          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {{ currentPost.content }}
          </p>

          <!-- Location -->
          <div
            v-if="currentPost.location_name"
            class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <UIcon name="i-heroicons-map-pin" class="text-primary" />
            <span class="font-medium">{{ currentPost.location_name }}</span>
          </div>

          <!-- Tags -->
          <div v-if="currentPost.tags?.length" class="flex flex-wrap gap-2">
            <UBadge
              v-for="tag in currentPost.tags"
              :key="tag"
              color="gray"
              variant="soft"
            >
              #{{ tag }}
            </UBadge>
          </div>
        </div>

        <!-- Post Footer -->
        <template #footer>
          <div class="flex items-center justify-between">
            <!-- Stats -->
            <div class="flex items-center gap-6 text-gray-600">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-eye" />
                <span>{{ currentPost.view_count || 0 }} views</span>
              </div>

              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-chat-bubble-left" />
                <span>{{ comments.length }} comments</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <UButton
                :icon="hasLiked ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                :color="hasLiked ? 'red' : 'gray'"
                variant="ghost"
                @click="handleReaction"
              >
                {{ reactionCount }}
              </UButton>

              <UButton
                v-if="isAuthor"
                icon="i-heroicons-pencil"
                variant="ghost"
                @click="showEditModal = true"
              >
                Edit
              </UButton>

              <UButton
                v-if="isAuthor && !currentPost.is_resolved"
                color="green"
                variant="ghost"
                @click="markAsResolved"
              >
                Mark Resolved
              </UButton>
            </div>
          </div>

          <!-- Resolved Badge -->
          <UAlert
            v-if="currentPost.is_resolved"
            color="green"
            variant="subtle"
            title="This post has been marked as resolved"
            class="mt-4"
          />
        </template>
      </UCard>

      <!-- Comments Section -->
      <CommentSection
        :post-id="currentPost.id"
        :comments="comments"
        :loading="loadingComments"
        @add-comment="handleAddComment"
      />
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 mx-auto mb-4 text-red-400" />
      <p class="text-gray-500 text-lg">Post not found</p>
    </div>

    <!-- Edit Post Modal -->
    <UModal v-model="showEditModal">
      <UCard>
        <template #header>
          <h3 class="text-xl font-bold">Edit Post</h3>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Title">
            <UInput v-model="editForm.title" />
          </UFormGroup>

          <UFormGroup label="Content">
            <UTextarea v-model="editForm.content" :rows="6" />
          </UFormGroup>

          <UFormGroup label="Location">
            <UInput v-model="editForm.location_name" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showEditModal = false">
              Cancel
            </UButton>
            <UButton @click="handleUpdatePost" :loading="updating">
              Save Changes
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
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
const showEditModal = ref(false)
const updating = ref(false)

const editForm = ref({
  title: '',
  content: '',
  location_name: ''
})

// Mock current user - replace with actual auth
const currentUserId = 'current-user-id'

const isAuthor = computed(() => {
  return currentPost.value?.user_id === currentUserId
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
    comments.value = await fetchComments(route.params.id)
  } finally {
    loadingComments.value = false
  }
}

const handleAddComment = async (commentData) => {
  const result = await addComment(route.params.id, {
    ...commentData,
    user_id: currentUserId
  })

  if (result) {
    await loadComments()
  }
}

const handleReaction = async () => {
  await toggleReaction(route.params.id, 'like')
  hasLiked.value = !hasLiked.value
  reactionCount.value += hasLiked.value ? 1 : -1
}

const markAsResolved = async () => {
  await updatePost(route.params.id, { is_resolved: true })
}

const handleUpdatePost = async () => {
  updating.value = true

  try {
    await updatePost(route.params.id, editForm.value)
    showEditModal.value = false
  } finally {
    updating.value = false
  }
}

onMounted(async () => {
  const postId = route.params.id
  await fetchPostById(postId)
  await loadComments()
  await incrementViewCount(postId)

  // Initialize edit form
  if (currentPost.value) {
    editForm.value = {
      title: currentPost.value.title,
      content: currentPost.value.content,
      location_name: currentPost.value.location_name || ''
    }
  }
})
</script>