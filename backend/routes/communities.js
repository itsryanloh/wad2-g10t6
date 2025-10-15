import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

//Get all communities 
//Route: GET /api/communities
router.get('/', async (req, res) => {
  try {
    const { location } = req.query;
    
    let query = supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false });
    
    //Filter by location if provided
    if (location) {
      query = query.ilike('location_name', `%${location}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: error.message });
  }
});

//Get Specific Community by ID
//Route: GET /api/communities/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Community not found' });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: error.message });
  }
});

//Check if user is a member of the community
//Route: GET /api/communities/:id/membership/:userId
router.get('/:id/membership/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', req.params.id)
      .eq('user_id', req.params.userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    res.json({ isMember: !!data });
  } catch (error) {
    console.error('Error checking membership:', error);
    res.status(500).json({ error: error.message });
  }
});

//Join a community
//Route: POST /api/communities/:id/join
router.post('/:id/join', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    //Check if already a member
    const { data: existing } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', req.params.id)
      .eq('user_id', user_id)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Already a member of this community' });
    }
    
    //Join the community
    const { data, error } = await supabase
      .from('community_members')
      .insert([{
        community_id: req.params.id,
        user_id
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({ message: 'Joined community successfully', data });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: error.message });
  }
});

//Leave a community
//Route: DELETE /api/communities/:id/leave
router.delete('/:id/leave', async (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', req.params.id)
      .eq('user_id', user_id);
    
    if (error) throw error;
    res.json({ message: 'Left community successfully' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: error.message });
  }
});

//Get posts from community
//Route: GET /api/communities/:id/posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (id, name, username, avatar_url),
        comments (id),
        post_reactions (id)
      `)
      .eq('community_id', req.params.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    //Add counts
    const postsWithCounts = data.map(post => ({
      ...post,
      comment_count: post.comments?.length || 0,
      reaction_count: post.post_reactions?.length || 0
    }));
    
    res.json(postsWithCounts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: error.message });
  }
});

//Create new community (for future)
//Route: POST /api/communities
router.post('/', async (req, res) => {
  try {
    const { name, description, location_name, created_by } = req.body;
    
    if (!name || !location_name) {
      return res.status(400).json({
        error: 'name and location_name are required'
      });
    }
    
    const { data, error } = await supabase
      .from('communities')
      .insert([{
        name,
        description,
        location_name
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    //Auto-join creator if provided
    if (created_by) {
      await supabase
        .from('community_members')
        .insert([{
          community_id: data.id,
          user_id: created_by
        }]);
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;