import { ref } from 'vue'

const API_BASE = 'http://localhost:3000/api/forum'
const COMMUNITIES_BASE = 'http://localhost:3000/api/communities'

export const useForum = () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // ============================================
  // COMMUNITY STATE
  // ============================================
  const communities = ref([])
  const currentCommunity = ref(null)
  const userCommunities = ref([])

  // ============================================
  // POST FUNCTIONS
  // ============================================
  
  //Fetch all posts
  const fetchPosts = async (filters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const params = new URLSearchParams(filters)
      const response = await fetch(`${API_BASE}/posts?${params}`)
      const data = await response.json()
      posts.value = data
      return data
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  //Fetch single post by ID
  const fetchPostById = async (postId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`)
      const data = await response.json()
      currentPost.value = data
      return data
    } catch (e) {
      error.value = e.message
      currentPost.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  //Create new post
  const createPost = async (postData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }
      
      const data = await response.json()
      posts.value.unshift(data)
      return data
    } catch (e) {
      error.value = e.message
      throw e 
    } finally {
      loading.value = false
    }
  }
  
  //Update post
  const updatePost = async (postId, updates) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update post')
      
      const data = await response.json()
      
      const index = posts.value.findIndex(p => p.id === postId)
      if (index !== -1) posts.value[index] = data
      
      if (currentPost.value?.id === postId) currentPost.value = data
      
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  //Delete post
  const deletePost = async (postId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete post')
      
      posts.value = posts.value.filter(p => p.id !== postId)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  //Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/comments`)
      const data = await response.json()
      return data
    } catch (e) {
      error.value = e.message
      return []
    }
  }

  //Add comment to post
  const addComment = async (postId, commentData) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      })
      
      if (!response.ok) throw new Error('Failed to add comment')
      
      const data = await response.json()
      return data
    } catch (e) {
      error.value = e.message
      return null
    }
  }

  //Toggle reaction on post
  const toggleReaction = async (postId, userId, reactionType = 'like') => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, reaction_type: reactionType })
      })
      
      if (!response.ok) throw new Error('Failed to toggle reaction')
      
      const data = await response.json()
      return data
    } catch (e) {
      error.value = e.message
      return null
    }
  }

  //Increment view count
  const incrementViewCount = async (postId) => {
    try {
      await fetch(`${API_BASE}/posts/${postId}/view`, {
        method: 'POST'
      })
    } catch (e) {
      console.error('Error incrementing view count:', e)
    }
  }

  //============================================
  // COMMUNITY FUNCTIONS
  // ============================================

  //Fetch all communities
  const fetchCommunities = async (filters = {}) => {
    loading.value = true
    try {
      const params = new URLSearchParams(filters)
      const response = await fetch(`${COMMUNITIES_BASE}?${params}`)
      const data = await response.json()
      communities.value = data
      return data
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  //Fetch single community by ID
  const fetchCommunityById = async (communityId) => {
    loading.value = true
    try {
      const response = await fetch(`${COMMUNITIES_BASE}/${communityId}`)
      const data = await response.json()
      currentCommunity.value = data
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  //Fetch user's joined communities
  const fetchUserCommunities = async (userId) => {
    try {
      const response = await fetch(`${COMMUNITIES_BASE}/users/${userId}`)
      const data = await response.json()
      userCommunities.value = data
      return data
    } catch (e) {
      error.value = e.message
      return []
    }
  }

  //Check if user is member of community
  const checkMembership = async (communityId, userId) => {
    try {
      const response = await fetch(`${COMMUNITIES_BASE}/${communityId}/membership/${userId}`)
      const data = await response.json()
      return data.isMember
    } catch (e) {
      error.value = e.message
      return false
    }
  }

  //Join community
  const joinCommunity = async (communityId, userId) => {
    try {
      const response = await fetch(`${COMMUNITIES_BASE}/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join community')
      }
      
      //Refresh user communities
      await fetchUserCommunities(userId)
      
      //Update community member count
      if (currentCommunity.value?.id === communityId) {
        currentCommunity.value.member_count += 1
      }
      
      return true
    } catch (e) {
      error.value = e.message
      return false
    }
  }

  //Leave community
  const leaveCommunity = async (communityId, userId) => {
    try {
      const response = await fetch(`${COMMUNITIES_BASE}/${communityId}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      
      if (!response.ok) throw new Error('Failed to leave community')
      
      //Refresh user communities
      await fetchUserCommunities(userId)
      
      //Update community member count
      if (currentCommunity.value?.id === communityId) {
        currentCommunity.value.member_count -= 1
      }
      
      return true
    } catch (e) {
      error.value = e.message
      return false
    }
  }

  //Fetch posts from specific community
  const fetchCommunityPosts = async (communityId) => {
    loading.value = true
    try {
      const response = await fetch(`${COMMUNITIES_BASE}/${communityId}/posts`)
      const data = await response.json()
      posts.value = data
      return data
    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  //Create new community (for future use)
  const createCommunity = async (communityData) => {
    loading.value = true
    try {
      const response = await fetch(`${COMMUNITIES_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communityData)
      })
      
      if (!response.ok) throw new Error('Failed to create community')
      
      const data = await response.json()
      communities.value.push(data)
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    //State
    posts,
    currentPost,
    loading,
    error,
    communities,
    currentCommunity,
    userCommunities,
    
    //Post functions
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    fetchComments,
    addComment,
    toggleReaction,
    incrementViewCount,
    
    //Community functions
    fetchCommunities,
    fetchCommunityById,
    fetchUserCommunities,
    checkMembership,
    joinCommunity,
    leaveCommunity,
    fetchCommunityPosts,
    createCommunity
  }
}