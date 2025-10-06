<template>
  <UCard 
    class="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    @click.stop="$emit('click')"
  >
    <!-- Post Header -->
    <template #header>
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <UAvatar 
            :src="post.users?.avatar_url" 
            :alt="post.users?.name"
            size="md"
          />
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">
              {{ post.users?.name || 'Anonymous' }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatDate(post.created_at) }}
            </p>
          </div>
        </div>
        
        <!-- Post Type Badge -->
        <UBadge 
          :color="getPostTypeColor(post.post_type)"
          variant="subtle"
        >
          {{ post.post_type }}
        </UBadge>
      </div>
    </template>

    <!-- Post Content -->
    <div class="space-y-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ post.title }}
      </h3>
      
      <p class="text-gray-600 dark:text-gray-300 line-clamp-3">
        {{ post.content }}
      </p>

      <!-- Location if available -->
      <div v-if="post.location_name" class="flex items-center gap-2 text-sm text-gray-500">
        <UIcon name="i-heroicons-map-pin" />
        <span>{{ post.location_name }}</span>
      </div>

      <!-- Tags -->
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
        <UBadge 
          v-for="tag in post.tags" 
          :key="tag"
          color="gray"
          variant="soft"
          size="xs"
        >
          #{{ tag }}
        </UBadge>
      </div>
    </div>

    <!-- Post Footer -->
    <template #footer>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-eye" />
            <span>{{ post.view_count || 0 }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-chat-bubble-left" />
            <span>{{ post.comment_count || 0 }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-heart" />
            <span>{{ post.reaction_count || 0 }}</span>
          </div>
        </div>

        <!-- Resolved Badge -->
        <UBadge 
          v-if="post.is_resolved"
          color="green"
          variant="subtle"
        >
          Resolved
        </UBadge>
      </div>
    </template>
  </UCard>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return d.toLocaleDateString()
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
</script>