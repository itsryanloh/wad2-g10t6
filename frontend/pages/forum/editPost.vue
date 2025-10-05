<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <UButton
          variant="ghost"
          icon="i-heroicons-arrow-left"
          @click="navigateTo(`/forum/${route.params.postId}`)"
          class="mb-4"
        >
          Back to Post
        </UButton>
        
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Post
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Update your post information
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading">
        <USkeleton class="h-96" />
      </div>

      <!-- Form Card -->
      <UCard v-else-if="currentPost" class="shadow-xl">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Post Type (Read-only) -->
          <UFormField label="Post Type">
            <UBadge
              :color="getPostTypeColor(currentPost.post_type)"
              variant="subtle"
              size="lg"
            >
              {{ currentPost.post_type }}
            </UBadge>
            <template #hint>
              Post type cannot be changed after creation
            </template>
          </UFormField>

          <!-- Title -->
          <UFormField label="Title" required>
            <UInput
              v-model="editForm.title"
              placeholder="Give your post a descriptive title..."
              size="xl"
              :maxlength="255"
            />
            <template #hint>
              {{ editForm.title?.length || 0 }}/255 characters
            </template>
          </UFormField>

          <!-- Content -->
          <UFormField label="Content" required>
            <UTextarea
              v-model="editForm.content"
              placeholder="Share details..."
              :rows="8"
              resize
            />
          </UFormField>

          <!-- Image URLs -->
          <UFormField 
            label="Images" 
            help="Enter image URLs, one per line"
          >
            <UTextarea
              v-model="imageUrlsText"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              :rows="4"
            />
            <template #hint>
              <div v-if="editForm.image_urls?.length" class="flex gap-2 mt-2 flex-wrap">
                <div
                  v-for="(url, index) in editForm.image_urls"
                  :key="index"
                  class="relative group"
                >
                  <img
                    :src="url"
                    class="w-20 h-20 object-cover rounded-lg"
                    @error="(e) => e.target.style.display = 'none'"
                  />
                </div>
              </div>
            </template>
          </UFormField>

          <!-- Location -->
          <UFormField label="Location">
            <UInput
              v-model="editForm.location_name"
              placeholder="e.g., Block 123 Ang Mo Kio Ave 3"
              size="lg"
              icon="i-heroicons-map-pin"
            />
          </UFormField>

          <!-- Tags -->
          <UFormField 
            label="Tags" 
            help="Comma separated tags"
          >
            <UInput
              v-model="tagsText"
              placeholder="e.g., tabby, friendly, orange"
              size="lg"
              icon="i-heroicons-tag"
            />
            <template #hint>
              <div v-if="editForm.tags?.length" class="flex flex-wrap gap-2 mt-2">
                <UBadge
                  v-for="tag in editForm.tags"
                  :key="tag"
                  color="blue"
                  variant="soft"
                >
                  #{{ tag }}
                </UBadge>
              </div>
            </template>
          </UFormField>

          <!-- Mark as Resolved (if applicable) -->
          <UFormField 
            v-if="['lost', 'found', 'adoption'].includes(currentPost.post_type)"
            label="Status"
          >
            <div class="flex items-center gap-3">
              <UToggle v-model="editForm.is_resolved" />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                Mark this post as resolved
              </span>
            </div>
          </UFormField>

          <!-- Action Buttons -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <!-- Delete Button -->
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="showDeleteConfirm = true"
            >
              Delete Post
            </UButton>

            <!-- Save/Cancel Buttons -->
            <div class="flex gap-3">
              <UButton
                type="button"
                variant="ghost"
                size="xl"
                @click="navigateTo(`/forum/${route.params.postId}`)"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                color="primary"
                size="xl"
                icon="i-heroicons-check"
                :loading="updating"
                :disabled="!isFormValid"
              >
                Save Changes
              </UButton>
            </div>
          </div>
        </form>
      </UCard>

      <!-- Error State -->
      <div v-else class="text-center py-20">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-24 h-24 mx-auto mb-4 text-red-400" />
        <p class="text-gray-500 text-lg">Post not found or you don't have permission to edit</p>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteConfirm">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500" />
            <h3 class="text-xl font-bold">Delete Post</h3>
          </div>
        </template>

        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              variant="ghost"
              @click="showDeleteConfirm = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              icon="i-heroicons-trash"
              @click="handleDelete"
              :loading="deleting"
            >
              Delete Permanently
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useForum } from '~/composables/useForum'

const route = useRoute()
const { currentPost, loading, fetchPostById, updatePost, deletePost } = useForum()

const updating = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)

const editForm = ref({
  title: '',
  content: '',
  location_name: '',
  image_urls: [],
  tags: [],
  is_resolved: false
})

const imageUrlsText = ref('')
const tagsText = ref('')

// Watch for changes
watch(imageUrlsText, (newVal) => {
  editForm.value.image_urls = newVal
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0)
})

watch(tagsText, (newVal) => {
  editForm.value.tags = newVal
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
})

const isFormValid = computed(() => {
  return editForm.value.title?.trim() && editForm.value.content?.trim()
})

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

const handleSubmit = async () => {
  if (!isFormValid.value) return

  updating.value = true

  try {
    await updatePost(route.params.postId, editForm.value)
    await navigateTo(`/forum/${route.params.postId}`)
  } catch (error) {
    console.error('Error updating post:', error)
  } finally {
    updating.value = false
  }
}

const handleDelete = async () => {
  deleting.value = true

  try {
    await deletePost(route.params.postId)
    await navigateTo('/forum')
  } catch (error) {
    console.error('Error deleting post:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  const postId = route.params.postId
  await fetchPostById(postId)

  // Initialize form with current post data
  if (currentPost.value) {
    editForm.value = {
      title: currentPost.value.title,
      content: currentPost.value.content,
      location_name: currentPost.value.location_name || '',
      image_urls: currentPost.value.image_urls || [],
      tags: currentPost.value.tags || [],
      is_resolved: currentPost.value.is_resolved || false
    }

    // Set text fields
    imageUrlsText.value = currentPost.value.image_urls?.join('\n') || ''
    tagsText.value = currentPost.value.tags?.join(', ') || ''
  }
})
</script>