export const useAuth = () => {
  const token = useCookie('token')
  const base_url = import.meta.env.VITE_BASE_URL

  const getCurrentUser = async () => {
    if (!token.value) {
      console.log('No token found')
      return null
    }
    
    try {
      //Verify token and get user data from JWT
      const tokenResponse = await fetch(`${base_url}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      
      if (!tokenResponse.ok) {
        console.error('Token verification failed')
        return null
      }
      
      const tokenData = await tokenResponse.json()
      
      //Fetch full user details from database
      const usersResponse = await fetch(`${base_url}/users`)
      const users = await usersResponse.json()
      
      //Find the current user by username from token
      const user = users.find(u => u.username === tokenData.username)
      
      if (!user) {
        console.error('User not found in database')
        return null
      }
      
      console.log('Current user loaded:', user.name)
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  const logout = () => {
    token.value = null
  }

  return {
    getCurrentUser,
    isAuthenticated,
    logout,
    token
  }
}