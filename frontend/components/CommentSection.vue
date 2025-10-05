<!-- frontend/components/CommentSection.vue -->
<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">Comments ({{ comments.length }})</h3>

    <!-- Add Comment Form -->
    <UCard>
      <UTextarea
        v-model="newComment"
        placeholder="Write a comment..."
        :rows="3"
      />
      <template #footer>
        <div class="flex justify-end">
          <UButton
            @click="submitComment"
            :loading="submitting"
            :disabled="!newComment.trim()"
          >
            Post Comment
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Comments List -->
    <div class="space-y-3">
      <CommentItem
        v-for="comment in topLevelComments"
        :key="comment.id"
        :comment="comment"
        :all-comments="comments"
        @reply="handleReply"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!loading && comments.length === 0" class="text-center py-8 text-gray-500">
      <UIcon name="i-heroicons-chat-bubble-left" class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>No comments yet. Be the first to comment!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  postId: {
    type: String,
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-comment'])

const newComment = ref('')
const submitting = ref(false)

// Filter top-level comments (no parent)
const topLevelComments = computed(() => {
  return props.comments.filter(c => !c.parent_comment_id)
})

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submitting.value = true
  
  try {
    await emit('add-comment', {
      content: newComment.value,
      post_id: props.postId
    })
    newComment.value = ''
  } finally {
    submitting.value = false
  }
}

const handleReply = async (commentData) => {
  await emit('add-comment', commentData)
}
</script>