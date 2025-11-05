// @ts-check
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import multer from 'multer';
import { getCommunityIdByAreaName } from '../utils/communities.js';
import { coordsToCommunity, findAreaName } from '../utils/maps.js';

//Load environment variables
dotenv.config();

const router = express.Router();

//environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, //file limit
  },
  fileFilter: (req, file, cb) => {
    //Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

//UPLOAD images endpoint
router.post('/upload-images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedUrls = [];

    //Upload each file to Supabase Storage
    for (const file of req.files) {
      //Generate unique filename
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
      const filepath = `post-images/${filename}`;

      //Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('postImages')
        .upload(filepath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      //Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('postImages')
        .getPublicUrl(filepath);

      uploadedUrls.push(publicUrl);
    }

    res.status(200).json({
      message: 'Files uploaded successfully',
      urls: uploadedUrls
    });

  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

//GET all posts with filters
router.get('/posts', async (req, res) => {
  try {
    const { type, search, tags, limit = 50 } = req.query;

    let query = supabase
      .from('posts')
      .select(`
        *,
        users (id, name, username, avatar_url),
        comments (count)
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

    //Fetch reaction counts for all posts
    const postIds = data.map(post => post.id);

    const { data: reactions, error: reactionsError } = await supabase
      .from('post_reactions')
      .select('post_id, reaction_type')
      .in('post_id', postIds);

    if (reactionsError) {
      console.error('Error fetching reactions:', reactionsError);
    }

    //Create a map of post_id to reaction counts
    const reactionCountsMap = {};

    if (reactions) {
      reactions.forEach(reaction => {
        if (!reactionCountsMap[reaction.post_id]) {
          reactionCountsMap[reaction.post_id] = {
            like: 0,
            heart: 0,
            helpful: 0,
            total: 0
          };
        }

        if (reactionCountsMap[reaction.post_id].hasOwnProperty(reaction.reaction_type)) {
          reactionCountsMap[reaction.post_id][reaction.reaction_type]++;
          reactionCountsMap[reaction.post_id].total++;
        }
      });
    }

    //Attach reaction counts to posts
    const postsWithCounts = data.map(post => ({
      ...post,
      comment_count: post.comments?.length || 0,
      reaction_count: reactionCountsMap[post.id]?.total || 0,
      reaction_counts: reactionCountsMap[post.id] || { like: 0, heart: 0, helpful: 0, total: 0 }
    }));

    res.json(postsWithCounts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

//GET single post by ID
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

//CREATE new post
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
        tags: tags || [],
        community_id: (await coordsToCommunity([location_lng, location_lat]))?.id
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

//UPDATE post
router.put('/posts/:id', async (req, res) => {
  try {
    const { title, content, location_name, location_lat, location_lng, is_resolved, image_urls, tags } = req.body;

    const updates = {
      community_id: (await coordsToCommunity([location_lng, location_lat]))?.id
    };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (location_name !== undefined) updates.location_name = location_name;
    if (location_lat !== undefined) updates.location_lat = location_lat;
    if (location_lng !== undefined) updates.location_lng = location_lng;
    if (is_resolved !== undefined) updates.is_resolved = is_resolved;
    if (image_urls !== undefined) updates.image_urls = image_urls;
    if (tags !== undefined) updates.tags = tags;

    console.log('Updating post:', req.params.id);
    console.log('Update payload:', updates);

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

    console.log('Post updated successfully:', data);
    res.json(data);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

//DELETE post
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

//GET comments for a post
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

//ADD comment to post
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

//GET reaction counts for a post
router.get('/posts/:id/reactions/counts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('reaction_type')
      .eq('post_id', req.params.id);

    if (error) throw error;

    //Count reactions by type
    const counts = {
      like: 0,
      heart: 0,
      helpful: 0
    };

    data.forEach(reaction => {
      if (counts.hasOwnProperty(reaction.reaction_type)) {
        counts[reaction.reaction_type]++;
      }
    });

    res.json(counts);
  } catch (error) {
    console.error('Error getting reaction counts:', error);
    res.status(500).json({ error: error.message });
  }
});

//TOGGLE reaction on post
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

//GET user's reactions for a post
router.get('/posts/:id/reactions', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id query parameter' });
    }

    const { data, error } = await supabase
      .from('post_reactions')
      .select('*')
      .eq('post_id', req.params.id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error getting user reactions:', error);
    res.status(500).json({ error: error.message });
  }
});

//INCREMENT view count
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
