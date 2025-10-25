import { ref } from 'vue'

interface Community {
  id: string
  name: string
  description?: string
  location_name: string
  member_count: number
  post_count: number
  created_at: string
  updated_at: string
}

interface CommunityMembership {
  id: string
  community_id: string
  user_id: string
  joined_at: string
  communities?: Community
}

interface Post {
  id: string
  title: string
  content: string
  post_type: string
  created_at: string
  users?: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
  comment_count?: number
  reaction_count?: number
}

export const useCommunities = () => {
  const communities = ref<Community[]>([])
  const currentCommunity = ref<Community | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'

  
  //Get all communities with optional location filter
  const fetchCommunities = async (location?: string): Promise<Community[]> => {
    loading.value = true
    error.value = null
    
    try {
      const url = location 
        ? `${API_BASE}/communities?location=${encodeURIComponent(location)}`
        : `${API_BASE}/communities`
      
      const response = await fetch(url)
      
      if (!response.ok) throw new Error('Failed to fetch communities')
      
      const data = await response.json()
      communities.value = data
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error fetching communities:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  
  //Get a specific community by ID
  const fetchCommunityById = async (communityId: string): Promise<Community | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}`)
      
      if (!response.ok) throw new Error('Community not found')
      
      const data = await response.json()
      currentCommunity.value = data
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error fetching community:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  //Create a new community
  const createCommunity = async (communityData: {
    name: string
    description?: string
    location_name: string
    created_by?: string
  }): Promise<Community | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communityData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create community')
      }
      
      const data = await response.json()
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error creating community:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  
  //Join a community
  const joinCommunity = async (communityId: string, userId: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join community')
      }
      
      return true
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error joining community:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  //Leave a community
  const leaveCommunity = async (communityId: string, userId: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to leave community')
      }
      
      return true
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error leaving community:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  //Check if a user is a member of a community
  const checkMembership = async (communityId: string, userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}/membership/${userId}`)
      
      if (!response.ok) return false
      
      const data = await response.json()
      return data.isMember || false
    } catch (e) {
      console.error('Error checking membership:', e)
      return false
    }
  }

  //Get all communities a user has joined
  const fetchUserCommunities = async (userId: string): Promise<CommunityMembership[]> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities/users/${userId}`)
      
      if (!response.ok) throw new Error('Failed to fetch user communities')
      
      const data = await response.json()
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error fetching user communities:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  //Get all posts from a community
  const fetchCommunityPosts = async (communityId: string): Promise<Post[]> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}/posts`)
      
      if (!response.ok) throw new Error('Failed to fetch community posts')
      
      const data = await response.json()
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error fetching community posts:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    communities,
    currentCommunity,
    loading,
    error,
    fetchCommunities,
    fetchCommunityById,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    checkMembership,
    fetchUserCommunities,
    fetchCommunityPosts
  }
}