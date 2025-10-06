<template>
  <div :class="['border-l-2 pl-4', depth > 0 ? 'ml-8 border-gray-300' : 'border-transparent']">
    <div class="flex gap-3">
      <UAvatar
        :src="comment.users?.avatar_url"
        :alt="comment.users?.name"
        size="sm"
      />
      
      <div class="flex-1 space-y-2">
        <!-- Comment Header -->
        <div class="flex items-center gap-2">
          <span class="font-semibold text-sm">
            {{ comment.users?.name || 'Anonymous' }}
          </span>
          <span class="text-xs text-gray-500">
            {{ formatDate(comment.created_at) }}
          </span>
        </div>

        <!-- Comment Content -->
        <p class="text-gray-700 dark:text-gray-300">
          {{ comment.content }}
        </p>

        <!-- Comment Actions -->
        <div class="flex items-center gap-4 text-sm">
          <button
            @click="showReplyForm = !showReplyForm"
            class="text-primary hover:underline"
          >
            Reply
          </button>
        </div>

        <!-- Reply Form -->
        <div v-if="showReplyForm" class="mt-3">
          <UTextarea
            v-model="replyContent"
            placeholder="Write a reply..."
            :rows="2"
            class="mb-2"
          />
          <div class="flex gap-2">
            <UButton
              size="sm"
              @click="submitReply"
              :disabled="!replyContent.trim()"
            >
              Reply
            </UButton>
            <UButton
              size="sm"
              variant="ghost"
              @click="cancelReply"
            >
              Cancel
            </UButton>
          </div>
        </div>

        <!-- Nested Replies -->
        <div v-if="replies.length > 0" class="mt-3 space-y-3">
          <CommentItem
            v-for="reply in replies"
            :key="reply.id"
            :comment="reply"
            :all-comments="allComments"
            :depth="depth + 1"
            @reply="$emit('reply', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  allComments: {
    type: Array,
    default: () => []
  },
  depth: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['reply'])

const showReplyForm = ref(false)
const replyContent = ref('')

// Get replies to this comment
const replies = computed(() => {
  return props.allComments.filter(c => c.parent_comment_id === props.comment.id)
})

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

const submitReply = () => {
  if (!replyContent.value.trim()) return
  
  emit('reply', {
    content: replyContent.value,
    parent_comment_id: props.comment.id,
    post_id: props.comment.post_id
  })
  
  replyContent.value = ''
  showReplyForm.value = false
}

const cancelReply = () => {
  replyContent.value = ''
  showReplyForm.value = false
}
</script>