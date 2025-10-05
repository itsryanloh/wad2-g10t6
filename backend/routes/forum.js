// backend/routes/forum.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// IMPORTANT: Load environment variables
dotenv.config();

const router = express.Router();

// Now these environment variables will be available
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET all posts with filters
router.get('/posts', async (req, res) => {
  try {
    const { type, search, tags, limit = 50 } = req.query;

    let query = supabase
      .from('posts')
      .select(`
        *,
        users (id, name, username, avatar_url),
        comments (count),
        post_reactions (count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('post_type', type);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (tags) {
      const tagArray = tags.split(',');
      query = query.contains('tags', tagArray);
    }

    const { data, error } = await query;

    if (error) throw error;

    const postsWithCounts = data.map(post => ({
      ...post,
      comment_count: post.comments?.length || 0,
      reaction_count: post.post_reactions?.length || 0
    }));

    res.json(postsWithCounts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (id, name, username, avatar_url)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Post not found' });

    res.json(data);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE new post
router.post('/posts', async (req, res) => {
  try {
    const {
      user_id,
      title,
      content,
      post_type,
      location_name,
      location_lat,
      location_lng,
      image_urls,
      tags
    } = req.body;

    if (!user_id || !title || !content || !post_type) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, title, content, post_type'
      });
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id,
        title,
        content,
        post_type,
        location_name,
        location_lat,
        location_lng,
        image_urls: image_urls || [],
        tags: tags || []
      }])
      .select(`
        *,
        users (id, name, username, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE post
router.put('/posts/:id', async (req, res) => {
  try {
    const { title, content, location_name, is_resolved } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (location_name !== undefined) updates.location_name = location_name;
    if (is_resolved !== undefined) updates.is_resolved = is_resolved;

    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', req.params.id)
      .select(`
        *,
        users (id, name, username, avatar_url)
      `)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Post not found' });

    res.json(data);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE post
router.delete('/posts/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET comments for a post
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (id, name, username, avatar_url)
      `)
      .eq('post_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADD comment to post
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { user_id, content, parent_comment_id } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, content'
      });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: req.params.id,
        user_id,
        content,
        parent_comment_id
      }])
      .select(`
        *,
        users (id, name, username, avatar_url)
      `)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// TOGGLE reaction on post
router.post('/posts/:id/reactions', async (req, res) => {
  try {
    const { user_id, reaction_type = 'like' } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id' });
    }

    const { data: existing } = await supabase
      .from('post_reactions')
      .select('*')
      .eq('post_id', req.params.id)
      .eq('user_id', user_id)
      .eq('reaction_type', reaction_type)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      res.json({ action: 'removed', reaction_type });
    } else {
      const { data, error } = await supabase
        .from('post_reactions')
        .insert([{
          post_id: req.params.id,
          user_id,
          reaction_type
        }])
        .select()
        .single();

      if (error) throw error;

      res.json({ action: 'added', reaction_type, data });
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// INCREMENT view count
router.post('/posts/:id/view', async (req, res) => {
  try {
    const { error } = await supabase.rpc('increment_post_views', {
      post_id: req.params.id
    });

    if (error) throw error;

    res.json({ message: 'View counted' });
  } catch (error) {
    console.error('Error incrementing view:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;