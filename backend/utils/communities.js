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
    .order('member_count', { ascending: false});
  
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
 * Link existing posts to a newly created community
 * @param {string} communityId - The ID of the newly created community
 * @param {string} locationName - The location name of the community
 * @returns {Promise<{count: number, error: any}>} Number of posts linked and any error
 */
export async function linkExistingPostsToCommunity(communityId, locationName) {
  try {
    //Find all posts without a community that match the location
    const { data: matchingPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, location_name')
      .is('community_id', null)
      .ilike('location_name', `%${locationName}%`);

    if (fetchError) {
      console.error('Error fetching matching posts:', fetchError);
      return { count: 0, error: fetchError };
    }

    if (!matchingPosts || matchingPosts.length === 0) {
      console.log(`No orphaned posts found for location: ${locationName}`);
      return { count: 0, error: null };
    }

    console.log(`Found ${matchingPosts.length} posts to link to community ${communityId}`);
    console.log('Matching posts:', matchingPosts.map(p => ({ 
      id: p.id, 
      title: p.title, 
      location: p.location_name 
    })));

    //Update all matching posts to link to this community
    const postIds = matchingPosts.map(p => p.id);
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ community_id: communityId })
      .in('id', postIds);

    if (updateError) {
      console.error('Error updating posts:', updateError);
      return { count: 0, error: updateError };
    }

    console.log(`✅ Successfully linked ${postIds.length} posts to community ${communityId}`);

    return { 
      count: postIds.length, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error in linkExistingPostsToCommunity:', error);
    return { count: 0, error };
  }
}

/**
 * Create a new community with auto-linking of existing posts
 * @param {Object} communityData 
 */
export async function createNewCommunity(communityData) {
  try {
    //Create community
    const { data, error } = await supabase
      .from('communities')
      .insert([{
        name: communityData.name,
        description: communityData.description,
        location_name: communityData.location_name
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating community:', error);
      return { data: null, error, status: 400 };
    }

    console.log('✅ Community created:', data);

    //Auto-join creator if provided
    if (communityData.created_by) {
      const { error: joinError } = await supabase
        .from('community_members')
        .insert([{
          community_id: data.id,
          user_id: communityData.created_by
        }]);

      if (joinError) {
        console.error('Error auto-joining creator:', joinError);
      } else {
        console.log('✅ Creator auto-joined community');
      }
    }

    //Link existing posts with matching location
    console.log(`🔍 Checking for existing posts in location: ${communityData.location_name}`);
    
    const linkResult = await linkExistingPostsToCommunity(
      data.id, 
      communityData.location_name
    );
    
    if (linkResult.error) {
      console.error('Error linking posts:', linkResult.error);
    } else if (linkResult.count > 0) {
      console.log(`✅ Linked ${linkResult.count} existing post(s) to new community`);
    } else {
      console.log('ℹ️ No existing posts found to link');
    }

    //Return the created community with additional info
    return { 
      data: {
        ...data,
        linked_posts_count: linkResult.count 
      }, 
      error: null, 
      status: 201 
    };
  } catch (error) {
    console.error('Unexpected error in createNewCommunity:', error);
    return { data: null, error: error.message, status: 500 };
  }
}

/**
 * Add user to community
 * @param {Object} param
 * @param {string} param.community_id
 * @param {string} param.user_id
 */
export async function addUserToCommunity({ community_id, user_id }) {
  //Check if already a member
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

  //Add counts
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

/**
 * Get statistics about posts and communities
 */
export async function getCommunityStatistics() {
  //Count total posts
  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  //Count posts that has no community
  const { count: orphanedPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .is('community_id', null);

  //Count communities
  const { count: totalCommunities } = await supabase
    .from('communities')
    .select('*', { count: 'exact', head: true });

  return {
    totalPosts: totalPosts || 0,
    orphanedPosts: orphanedPosts || 0,
    linkedPosts: (totalPosts || 0) - (orphanedPosts || 0),
    totalCommunities: totalCommunities || 0,
    linkageRate: totalPosts ? ((totalPosts - orphanedPosts) / totalPosts * 100).toFixed(1) : 0
  };
}

/**
 * Get details about orphaned posts grouped by location
 */
export async function getOrphanedPostsByLocation() {
  const { data: orphanedPosts, error } = await supabase
    .from('posts')
    .select('location_name')
    .is('community_id', null)
    .not('location_name', 'is', null);

  if (error || !orphanedPosts) {
    return { data: [], error };
  }

  //Group by location
  const locationCounts = {};
  orphanedPosts.forEach(post => {
    const location = post.location_name;
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  //Convert to array and sort by count
  const locationList = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  return { 
    data: locationList, 
    error: null,
    totalOrphaned: orphanedPosts.length
  };
}