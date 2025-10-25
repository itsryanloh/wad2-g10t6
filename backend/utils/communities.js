import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Get all communities with optional location filter
 * @param {string} [location] - Optional location filter
 */
export async function getAllCommunities(location) {
  let query = supabase
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false });
  
  if (location) {
    query = query.ilike('location_name', `%${location}%`);
  }
  
  return await query;
}

/**
 * Get community by ID
 * @param {string} communityId 
 */
export async function getCommunityById(communityId) {
  return await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .single();
}

/**
 * Create a new community
 * @param {Object} communityData 
 */
export async function createNewCommunity(communityData) {
  const { data, error } = await supabase
    .from('communities')
    .insert([{
      name: communityData.name,
      description: communityData.description,
      location_name: communityData.location_name
    }])
    .select()
    .single();

  if (error) return { data: null, error, status: 400 };

  // Auto-join creator if provided
  if (communityData.created_by) {
    await supabase
      .from('community_members')
      .insert([{
        community_id: data.id,
        user_id: communityData.created_by
      }]);
  }

  return { data, error: null, status: 201 };
}

/**
 * Add user to community
 * @param {Object} param
 * @param {string} param.community_id
 * @param {string} param.user_id
 */
export async function addUserToCommunity({ community_id, user_id }) {
  // Check if already a member
  const { data: existing } = await supabase
    .from('community_members')
    .select('*')
    .eq('community_id', community_id)
    .eq('user_id', user_id)
    .single();

  if (existing) {
    return { 
      data: null, 
      error: { message: 'Already a member of this community' },
      status: 400 
    };
  }

  return await supabase
    .from('community_members')
    .insert([{ community_id, user_id }])
    .select()
    .single();
}

/**
 * Remove user from community
 * @param {Object} param
 * @param {string} param.community_id
 * @param {string} param.user_id
 */
export async function removeUserFromCommunity({ community_id, user_id }) {
  return await supabase
    .from('community_members')
    .delete()
    .eq('community_id', community_id)
    .eq('user_id', user_id);
}

/**
 * Get all communities a user has joined
 * @param {string} userId 
 */
export async function getUserCommunitiesList(userId) {
  return await supabase
    .from('community_members')
    .select(`
      *,
      communities (*)
    `)
    .eq('user_id', userId);
}

/**
 * Check if user is a member of community
 * @param {Object} param
 * @param {string} param.community_id
 * @param {string} param.user_id
 */
export async function isUserMemberOfCommunity({ community_id, user_id }) {
  const { data, error } = await supabase
    .from('community_members')
    .select('*')
    .eq('community_id', community_id)
    .eq('user_id', user_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error, status: 500 };
  }

  return { 
    data: { isMember: !!data },
    error: null,
    status: 200 
  };
}

/**
 * Get all posts from a community
 * @param {string} communityId 
 */
export async function getPostsByCommunityId(communityId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (id, name, username, avatar_url),
      comments (id),
      post_reactions (id)
    `)
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error, status: 500 };

  // Add counts
  const postsWithCounts = data.map(post => ({
    ...post,
    comment_count: post.comments?.length || 0,
    reaction_count: post.post_reactions?.length || 0
  }));

  return { 
    data: postsWithCounts,
    error: null,
    status: 200 
  };
}

/**
 * Get community ID by area/location name
 * @param {string} areaName - The area/location name to search for
 */
export async function getCommunityIdByAreaName(areaName) {
  return await supabase
    .from('communities')
    .select('id')
    .ilike('location_name', `%${areaName}%`)
    .limit(1)
    .maybeSingle();
}