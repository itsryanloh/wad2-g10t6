<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🐾 Community Forum
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            The Purr-fect Place to Share Sightings, Find Lost Cats, Adopt them and Connect!
          </p>
        </div>
        
        <UButton
          icon="i-heroicons-plus"
          size="lg"
          @click="showCreateModal = true"
          class="self-start md:self-auto"
        >
          New Post
        </UButton>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <UInput
            v-model="searchQuery"
            placeholder="Search posts..."
            icon="i-heroicons-magnifying-glass"
            class="flex-1"
            size="lg"
          />

          <!-- Post Type Filter -->
          <USelectMenu
            v-model="selectedType"
            :options="postTypes"
            placeholder="All Types"
            class="w-full sm:w-48"
            size="lg"
          />

          <!-- Sort -->
          <USelectMenu
            v-model="sortBy"
            :options="sortOptions"
            placeholder="Sort by"
            class="w-full sm:w-48"
            size="lg"
          />
        </div>
      </div>

      <!-- Posts Grid -->
      <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <USkeleton v-for="i in 6" :key="i" class="h-80" />
      </div>

      <div v-else-if="filteredPosts.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
          @click="navigateTo(`/forum/${post.id}`)"
        />
      </div>

      <div v-else class="text-center py-20">
        <UIcon name="i-heroicons-inbox" class="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p class="text-gray-500 text-xl font-medium mb-2">No posts found</p>
        <p class="text-gray-400 text-sm">Try adjusting your filters or create a new post</p>
      </div>

      <!-- Create Post Modal -->
      <UModal v-model="showCreateModal" :ui="{ width: 'sm:max-w-2xl' }">
        <UCard>
          <template #header>
            <h3 class="text-2xl font-bold">Create New Post</h3>
          </template>

          <div class="space-y-5">
            <UFormGroup label="Post Type" required>
              <USelectMenu
                v-model="newPost.post_type"
                :options="postTypes.filter(t => t.value)"
                placeholder="Select post type"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="Title" required>
              <UInput
                v-model="newPost.title"
                placeholder="Enter post title"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="Content" required>
              <UTextarea
                v-model="newPost.content"
                placeholder="Describe the situation in detail..."
                :rows="6"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="Images/Videos (Optional)" help="Enter image URLs, one per line">
              <UTextarea
                v-model="imageUrlsInput"
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                :rows="3"
              />
            </UFormGroup>

            <UFormGroup label="Location">
              <UInput
                v-model="newPost.location_name"
                placeholder="e.g., Ang Mo Kio Block 123"
                icon="i-heroicons-map-pin"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="Tags (comma separated)">
              <UInput
                v-model="tagsInput"
                placeholder="friendly, orange, young"
                size="lg"
              />
              <div v-if="newPost.tags.length" class="flex flex-wrap gap-2 mt-3">
                <UBadge
                  v-for="tag in newPost.tags"
                  :key="tag"
                  color="primary"
                  variant="soft"
                  size="md"
                >
                  #{{ tag }}
                </UBadge>
              </div>
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="ghost"
                size="lg"
                @click="closeCreateModal"
              >
                Cancel
              </UButton>
              <UButton
                size="lg"
                @click="createNewPost"
                :loading="creating"
                :disabled="!isFormValid"
              >
                Create Post
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useForum } from '~/composables/useForum'

const { posts, loading, fetchPosts, createPost } = useForum()

const searchQuery = ref('')
const selectedType = ref('')
const sortBy = ref('newest')
const showCreateModal = ref(false)
const creating = ref(false)

const postTypes = [
  { label: 'All Types', value: '' },
  { label: 'Adoption', value: 'adoption' },
  { label: 'Sighting', value: 'sighting' },
  { label: 'Lost', value: 'lost' },
  { label: 'Found', value: 'found' },
  { label: 'Discussion', value: 'discussion' },
  { label: 'Update', value: 'update' }
]

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Most Viewed', value: 'views' },
  { label: 'Most Commented', value: 'comments' }
]

const newPost = ref({
  post_type: '',
  title: '',
  content: '',
  location_name: '',
  image_urls: [],
  tags: []
})

const tagsInput = ref('')
const imageUrlsInput = ref('')

// Watch tags input and convert to array
watch(tagsInput, (val) => {
  newPost.value.tags = val.split(',').map(t => t.trim()).filter(Boolean)
})

// Watch image URLs input and convert to array
watch(imageUrlsInput, (val) => {
  newPost.value.image_urls = val.split('\n').map(url => url.trim()).filter(Boolean)
})

// Filtered and sorted posts
const filteredPosts = computed(() => {
  let filtered = [...posts.value]

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query)
    )
  }

  // Filter by type
  if (selectedType.value) {
    filtered = filtered.filter(p => p.post_type === selectedType.value)
  }

  // Sort
  if (sortBy.value === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else if (sortBy.value === 'views') {
    filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
  } else if (sortBy.value === 'comments') {
    filtered.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0))
  }

  return filtered
})

const isFormValid = computed(() => {
  return newPost.value.post_type &&
         newPost.value.title.trim() &&
         newPost.value.content.trim()
})

const createNewPost = async () => {
  if (!isFormValid.value) return

  creating.value = true
  
  try {
    await createPost({
      ...newPost.value,
      user_id: 'current-user-id' // Replace with actual user ID from auth
    })
    
    closeCreateModal()
  } finally {
    creating.value = false
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newPost.value = {
    post_type: '',
    title: '',
    content: '',
    location_name: '',
    image_urls: [],
    tags: []
  }
  tagsInput.value = ''
  imageUrlsInput.value = ''
}

onMounted(() => {
  fetchPosts()
})
</script>