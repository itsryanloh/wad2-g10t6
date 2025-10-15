<template>
  <div class="community-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">
        <i class="fas fa-users me-2"></i>
        My Communities
      </h3>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading communities...</span>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="userCommunities.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-users"></i>
      </div>
      <p class="empty-text">You haven't joined any communities yet!</p>
      <button @click="$emit('browse-communities')" class="btn-browse">
        <i class="fas fa-compass me-2"></i>
        Browse Communities
      </button>
    </div>
    
    <!-- Communities List -->
    <div v-else class="communities-list">
      <!-- All Posts Option -->
      <div
        @click="$emit('select-community', null)"
        :class="['community-item', { active: selectedId === null }]"
      >
        <div class="community-icon all-posts">
          <i class="fas fa-globe"></i>
        </div>
        <div class="community-info">
          <div class="community-name">All Posts</div>
          <div class="community-desc">View all posts</div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- User's Communities -->
      <div
        v-for="membership in userCommunities"
        :key="membership.id"
        @click="$emit('select-community', membership.communities)"
        :class="['community-item', { active: selectedId === membership.communities.id }]"
      >
        <div class="community-icon">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="community-info">
          <div class="community-name">{{ membership.communities.name }}</div>
          <div class="community-stats">
            <span><i class="fas fa-users"></i> {{ membership.communities.member_count }}</span>
            <span><i class="fas fa-newspaper"></i> {{ membership.communities.post_count }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Browse More Button -->
    <button 
      v-if="userCommunities.length > 0"
      @click="$emit('browse-communities')" 
      class="btn-find-more"
    >
      <i class="fas fa-plus me-2"></i>
      Find More Communities
    </button>
  </div>
</template>

<script setup>
defineProps({
  userCommunities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedId: {
    type: String,
    default: null
  }
})

defineEmits(['select-community', 'browse-communities'])
</script>

<style scoped>
.community-sidebar {
  background: white;
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.sidebar-header {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  padding: 20px;
  color: white;
}

.sidebar-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: #7A7265;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.loading-state i {
  font-size: 2rem;
  color: #FF9800;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.empty-text {
  color: #7A7265;
  margin-bottom: 20px;
  font-size: 1rem;
}

.btn-browse {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.btn-browse:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 152, 0, 0.4);
}

.communities-list {
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.communities-list::-webkit-scrollbar {
  width: 6px;
}

.communities-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.communities-list::-webkit-scrollbar-thumb {
  background: #FFB74D;
  border-radius: 10px;
}

.communities-list::-webkit-scrollbar-thumb:hover {
  background: #FF9800;
}

.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #FFE8D6, transparent);
  margin: 10px 0;
}

.community-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  margin-bottom: 8px;
}

.community-item:hover {
  background: rgba(255, 152, 0, 0.08);
  border-color: #FFB74D;
  transform: translateX(5px);
}

.community-item.active {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border-color: #FF9800;
  box-shadow: 0 5px 15px rgba(255, 152, 0, 0.3);
}

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
  transition: all 0.3s;
}

.community-icon.all-posts {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.community-item.active .community-icon {
  background: white;
  color: #FF9800;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.community-item.active .community-icon.all-posts {
  color: #667eea;
}

.community-info {
  flex: 1;
  min-width: 0;
}

.community-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.community-desc {
  font-size: 0.85rem;
  opacity: 0.8;
}

.community-stats {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  opacity: 0.9;
}

.community-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.community-item.active .community-stats,
.community-item.active .community-desc {
  opacity: 1;
}

.btn-find-more {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
  border: none;
  border-radius: 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-find-more:hover {
  background: linear-gradient(135deg, #F57C00 0%, #E65100 100%);
  box-shadow: 0 -5px 20px rgba(255, 152, 0, 0.3);
}

/* Responsive */
@media (max-width: 991px) {
  .community-sidebar {
    margin-bottom: 20px;
  }
}
</style>