<template>
  <div class="community-sidebar">
    <!-- Header with Background -->
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        <i class="fas fa-users me-2"></i>My Communities
      </h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-small"></div>
      <p class="loading-text">Loading...</p>
    </div>

    <!-- Communities List -->
    <div v-else class="communities-list">
      <!-- All Posts Option -->
      <div 
        @click="selectCommunity(null)"
        :class="['community-item', 'all-posts', { active: !selectedId }]"
      >
        <div class="community-icon">
          <i class="fas fa-globe"></i>
        </div>
        <div class="community-info">
          <span class="community-name">All Posts</span>
          <span class="community-desc">View all posts</span>
        </div>
      </div>

      <!-- User's Communities -->
      <div 
        v-for="membership in userCommunities" 
        :key="membership.id"
        @click="selectCommunity(membership.communities)"
        :class="['community-item', { active: selectedId === membership.communities?.id }]"
      >
        <div class="community-icon">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="community-info">
          <span class="community-name">{{ membership.communities?.name || 'Unknown' }}</span>
          <div class="community-stats">
            <span><i class="fas fa-users"></i> {{ membership.communities?.member_count || 0 }}</span>
            <span><i class="fas fa-newspaper"></i> {{ membership.communities?.post_count || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && userCommunities.length === 0" class="empty-communities">
        <i class="fas fa-inbox"></i>
        <p>No communities yet</p>
        <small>Join or create a community!</small>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userCommunities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedId: {
    type: [Number, String, null],
    default: null
  }
})

const emit = defineEmits(['select-community'])

const selectCommunity = (community) => {
  emit('select-community', community)
}
</script>

<style scoped>
.community-sidebar {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
}

/* Sidebar */
.sidebar-header {
  background: linear-gradient(135deg, #FFB74D 0%, #FFA726 50%, #FF9800 100%);
  padding: 20px;
  margin: 0;
  border: none;
}

.sidebar-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-title i {
  color: white;
  filter: drop-shadow(1px 2px 2px rgba(0, 0, 0, 0.2));
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 30px 20px;
}

.spinner-small {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 3px solid #FFE0B2;
  border-top-color: #FF9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #7A7265;
  margin: 0;
  font-size: 0.9rem;
}

/* Communities List */
.communities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

/* Community Item */
.community-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s;
  background: #FFFBF5;
  border: 2px solid #FFE0B2; 
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.08);
}

.community-item:hover {
  background: #FFF8F0;
  border-color: #FFCC80; 
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15); 
}

.community-item.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  border-color: #F57C00; 
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.community-item.active .community-name,
.community-item.active .community-desc,
.community-item.active .community-stats {
  color: white !important;
}

.community-item.active .community-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.community-item.active .community-stats i {
  color: white;
}

.community-item.all-posts {
  background: linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%);
  border: 2px solid #FFB74D; 
  box-shadow: 0 3px 10px rgba(255, 183, 77, 0.2); 
}

.community-item.all-posts:hover {
  background: linear-gradient(135deg, #FFCC80 0%, #FFB74D 100%);
  border-color: #FF9800;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.25);
}

.community-item.all-posts.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  border-color: #F57C00;
}

/* Community Icon */
.community-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(255, 152, 0, 0.3); 
}

/* Community Info */
.community-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.community-name {
  font-weight: 600;
  color: #5D4E37;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.community-desc {
  font-size: 0.85rem;
  color: #7A7265;
}

.community-stats {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #999;
}

.community-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.community-stats i {
  color: #FF9800;
  font-size: 0.75rem;
}

/* Empty State */
.empty-communities {
  text-align: center;
  padding: 40px 20px;
}

.empty-communities i {
  font-size: 3rem;
  color: #FFB74D;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-communities p {
  color: #5D4E37;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.empty-communities small {
  color: #7A7265;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-header {
    padding: 15px;
  }

  .sidebar-title {
    font-size: 1.1rem;
  }

  .communities-list {
    padding: 15px;
    gap: 10px;
  }

  .community-item {
    padding: 12px;
  }

  .community-item.all-posts {
    margin-bottom: 6px;
  }

  .community-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
}
</style>
