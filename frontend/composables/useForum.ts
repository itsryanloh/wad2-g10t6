import { ref } from 'vue'

interface PostFilters {
  type?: string
  search?: string
  tags?: string[]
}

interface Post {
  id: string
  user_id: string
  title: string
  content: string
  post_type: string
  location_name?: string
  image_urls?: string[]
  tags?: string[]
  view_count?: number
  is_resolved?: boolean
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

interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id?: string
  created_at: string
  users?: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
}

export const useForum = () => {
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const API_BASE = 'http://localhost:3000/api'

  // Fetch all posts with optional filters
  const fetchPosts = async (filters: PostFilters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)
      if (filters.tags) params.append('tags', filters.tags.join(','))
      
      const url = `${API_BASE}/posts?${params.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) throw new Error('Failed to fetch posts')
      
      const data = await response.json()
      posts.value = data
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error fetching posts:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch single post by ID
  const fetchPostById = async (postId: string): Promise<Post | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`)
      
      if (!response.ok) throw new Error('Post not found')
      
      const data = await response.json()
      currentPost.value = data
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error fetching post:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create new post
  const createPost = async (postData: any): Promise<Post | null> => {
    loading.value = true
    error.value = null
    
    try 
    {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }
      
      const data = await response.json()
      
      // Add to beginning of posts array
      posts.value.unshift(data)
      
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error creating post:', e)
      throw e 
    } finally {
      loading.value = false
    }
  }
  
  // Update post
  const updatePost = async (postId: string, updates: any): Promise<Post | null> => {
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
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error updating post:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete post
  const deletePost = async (postId: string): Promise<boolean> => {
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
      const errorMessage = e instanceof Error ? e.message : 'An error occurred'
      error.value = errorMessage
      console.error('Error deleting post:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // Fetch comments for a post
  const fetchComments = async (postId: string): Promise<Comment[]> => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/comments`)
      
      if (!response.ok) throw new Error('Failed to fetch comments')
      
      return await response.json()
    } catch (e) {
      console.error('Error fetching comments:', e)
      return []
    }
  }

  // Add comment to post
  const addComment = async (postId: string, commentData: any): Promise<Comment | null> => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      })
      
      if (!response.ok) throw new Error('Failed to add comment')
      
      return await response.json()
    } catch (e) {
      console.error('Error adding comment:', e)
      return null
    }
  }

  // Toggle reaction on post
  const toggleReaction = async (postId: string, userId: string, reactionType: string = 'like'): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, reaction_type: reactionType })
      })
      
      if (!response.ok) throw new Error('Failed to toggle reaction')
      
      return await response.json()
    } catch (e) {
      console.error('Error toggling reaction:', e)
      return null
    }
  }

  // Increment view count
  const incrementViewCount = async (postId: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/posts/${postId}/view`, { method: 'POST' })
    } catch (e) {
      console.error('Error incrementing view:', e)
    }
  }

  return {
    posts,
    currentPost,
    loading,
    error,
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    fetchComments,
    addComment,
    toggleReaction,
    incrementViewCount
  }
}