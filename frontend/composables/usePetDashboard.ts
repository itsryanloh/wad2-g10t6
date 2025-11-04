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

export const post_types = ["adoption", "sighting", "lost", "found"] as const

type SortedPosts = Record<string, Post[]>

import { ref, computed } from "vue"
import { useFetch } from "#app";

export const usePetDashboard = async () => {
  const communities = (await useFetch<Community[]>(`${VITE_BASE_URL}/communities`)).data
  const posts = ref<SortedPosts>({})
  const error = ref(null)

  const statistics = computed(() => {
    const stats = Object.fromEntries(
      Object.entries(posts.value).map(([k, posts]) => [k, posts.reduce((accum, { post_type }) => {
        accum[post_type]!++
        return accum
      }, Object.fromEntries(
        post_types.map(type => [type, 0])
      ))])
    )
    Object.entries(stats).forEach(([_, obj]) => {
      obj.total = Object.entries(obj).reduce((accum, [_, v]) => accum + v, 0)
    })
    return stats
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
