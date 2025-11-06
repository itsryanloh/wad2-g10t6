<template>
  <div class="comment-item">
    <img :src="comment.users?.avatar_url || 'https://i.pravatar.cc/150'" class="comment-avatar" />
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author">{{ comment.users?.name || "Anonymous" }}</span>
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
        <textarea v-model="replyContent" placeholder="Write a reply..." rows="2" class="reply-textarea"></textarea>
        <div class="reply-actions">
          <button @click="cancelReply" class="cancel-reply-btn">Cancel</button>
          <button @click="handleReply(comment.id)" :disabled="!replyContent.trim() || addingComment"
            class="submit-reply-btn">
            <i class="fas fa-paper-plane me-1"></i>
            {{ addingComment ? "Posting..." : "Reply" }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="getReplies(comment.id).length" class="replies-container">
    <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="reply-wrapper">
      <Comment @refresh="$emit('refresh')" :comment="reply" :comments="props.comments" :currentUserId="props.currentUserId" />
    </div>
  </div>
</template>
<script setup>
import Comment from './Comment.vue';
import { useForum } from '~/composables/useForum'

const emit = defineEmits(['refresh'])
const route = useRoute()
const { addComment } = useForum()
const props = defineProps(["comment", "currentUserId", "comments"]);
const replyingTo = ref(null);
const replyContent = ref("");
const addingComment = ref(false);

const toggleReply = (commentId) => {
  if (replyingTo.value === commentId) {
    replyingTo.value = null;
    replyContent.value = "";
  } else {
    replyingTo.value = commentId;
    replyContent.value = "";
  }
};

const formatDate = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return postDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = "";
};

const handleReply = async (parentCommentId) => {
  if (!replyContent.value.trim()) return;

  if (!props.currentUserId) {
    alert("Please log in to comment");
    return;
  }

  addingComment.value = true;
  try {
    const result = await addComment(route.params.postId, {
      content: replyContent.value,
      user_id: props.currentUserId,
      parent_comment_id: parentCommentId,
    });

    if (result) {
      replyContent.value = "";
      replyingTo.value = null;
      emit('refresh')
    }
  } catch (error) {
    console.error("Error adding reply:", error);
    alert("Error posting reply. Please try again.");
  } finally {
    addingComment.value = false;
  }
};

const getReplies = (commentId) => {
  return props.comments.filter(c => c.parent_comment_id === commentId)
}
</script>
<style>
.comment-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #fff4e6 0%, #ffffff 100%);
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
  border: 3px solid #ffb88c;
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
  color: #5d4e37;
}

.comment-date {
  font-size: 0.85rem;
  color: #7a7265;
}

.comment-text {
  color: #7a7265;
  line-height: 1.6;
  margin: 0;
}

.reply-form {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  border: 2px solid #ffb74d;
  animation: slideDown 0.3s ease;
}

/* Reply button */
.reply-btn {
  background: rgba(255, 152, 0, 0.1);
  border: 2px solid rgba(255, 152, 0, 0.3);
  color: #ff9800;
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
  border: 2px solid #ffb74d;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.reply-textarea:focus {
  outline: none;
  border-color: #ff9800;
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
  color: #7a7265;
  border: 2px solid rgba(122, 114, 101, 0.2);
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-reply-btn:hover {
  background: #7a7265;
  color: white;
}

.submit-reply-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
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

.reply-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
