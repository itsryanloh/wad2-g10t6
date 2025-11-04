const { VITE_BASE_URL } = import.meta.env;

export type Community = Record<"id" | "name" | "description", string>
type Post = {
  id: string,
  user_id: string,
  title: string,
  content: string,
  post_type: string,
  location_name: string,
  location_lat: number,
  location_lng: number,
  image_urls: string[],
  tags: string[],
  view_count: number,
  is_resolved: boolean,
  created_at: string,
  updated_at: string,
  community_id: string,
  users: {
    id: string,
    name: string,
    username: string,
    avatar_url: string
  },
  comments: [
    {
      count: number
    }
  ],
  post_reactions: [
    {
      count: number
    }
  ],
  comment_count: number,
  reaction_count: number
}

type SortedPosts = Record<string, Post[]>

import { ref, computed } from "vue"

export const usePetDashboard = async () => {
  const communities = (await useFetch<Community[]>(`${VITE_BASE_URL}/communities`)).data
  const posts = ref<SortedPosts>({})
  const error = ref(null)

  const statistics = computed(() => {
    const total = communities.value.length
    const lost = communities.value.filter(p => p.status === 'lost').length
    const found = communities.value.filter(p => p.status === 'found').length
    const adopted = communities.value.filter(p => p.status === 'adopted').length
    const available = communities.value.filter(p => p.status === 'available').length

    const adoptionRate = total > 0 ? ((adopted / total) * 100).toFixed(1) : '0'
    const lostRate = total > 0 ? ((lost / total) * 100).toFixed(1) : '0'

    return {
      total,
      lost,
      found,
      adopted,
      available,
      adoptionRate,
      lostRate
    }
  })

  const fetchAllData = async () => {
    return fetch(`${VITE_BASE_URL}/posts`)
      .then<Post[]>(data => data.json())
      .then(data => data.reduce<SortedPosts>((accum, elem) =>
        ({ ...accum, [elem.community_id]: accum[elem.community_id] ? [...accum[elem.community_id]!, elem] : [elem] })
        , {}))
      .then(map => posts.value = map)
  }

  return {
    communities,
    posts,
    error,
    statistics,
    fetchAllData
  }
}
