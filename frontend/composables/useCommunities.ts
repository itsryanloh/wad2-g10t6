import { ref } from 'vue'

interface Community {
  id: string
  name: string
  description?: string
  location_name?: string
  member_count?: number
  post_count?: number
  created_at?: string
}

interface CommunityMembership {
  id: string
  user_id: string
  community_id: string
  joined_at: string
  communities?: Community
}

export const useCommunities = () => {
  const userCommunities = ref<CommunityMembership[]>([])
  const allCommunities = ref<Community[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const API_BASE = import.meta.env.VITE_BASE_URL

  //Fetch all available communities
  const fetchAllCommunities = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities`)
      
      if (!response.ok) throw new Error('Failed to fetch communities')
      
      const data = await response.json()
      allCommunities.value = data
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

  //Fetch user's joined communities with full details
  const fetchUserCommunities = async (userId: string) => {
    loading.value = true
    error.value = null
    
    try {
      //Fetch community memberships for the user
      const response = await fetch(`${API_BASE}/communities/members?user_id=${userId}`)
      
      if (!response.ok) throw new Error('Failed to fetch user communities')
      
      const memberships = await response.json()
      
      //Fetch full community details for each membership
      const communitiesWithDetails = await Promise.all(
        memberships.map(async (membership: any) => {
          try {
            const communityResponse = await fetch(`${API_BASE}/communities/${membership.community_id}`)
            const communityData = await communityResponse.json()
            
            return {
              ...membership,
              communities: communityData
            }
          } catch (err) {
            console.error(`Error fetching community ${membership.community_id}:`, err)
            return membership
          }
        })
      )
      
      userCommunities.value = communitiesWithDetails
      return communitiesWithDetails
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error fetching user communities:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  //Join a community
  const joinCommunity = async (userId: string, communityId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          community_id: communityId
        })
      })
      
      if (!response.ok) throw new Error('Failed to join community')
      
      // Refresh user communities after joining
      await fetchUserCommunities(userId)
      
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

  // Leave a community
  const leaveCommunity = async (userId: string, communityId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/communities?user_id=${userId}&community_id=${communityId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to leave community')
      
      // Refresh user communities after leaving
      await fetchUserCommunities(userId)
      
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

  return {
    userCommunities,
    allCommunities,
    loading,
    error,
    fetchAllCommunities,
    fetchUserCommunities,
    joinCommunity,
    leaveCommunity
  }
}