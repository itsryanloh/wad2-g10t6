import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET all users (for user selection)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, contact_no, age, gender, avatar_url, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET current user by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, contact_no, age, gender, avatar_url, role, created_at, updated_at')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user profile
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, username, contact_no, age, gender, avatar_url } = req.body;

    console.log('Updating user:', userId);
    console.log('Update data:', { name, username, contact_no, age, gender, avatar_url });

    // Build update object
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username;
    if (contact_no !== undefined) updates.contact_no = contact_no;
    if (age !== undefined) updates.age = age;
    if (gender !== undefined) updates.gender = gender;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    // Perform update
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.error('No user found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Get first result and remove password
    const updatedUser = data[0];
    delete updatedUser.password;

    console.log('User updated successfully:', updatedUser.id);
    res.json(updatedUser);

  } catch (error) {
    console.error('Error in PUT /users/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE password
router.put('/:id/password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ 
        error: 'Current and new password required' 
      });
    }

    // Verify current password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if current password matches
    if (user.password !== current_password) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: new_password,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: error.message });
  }
});
export default router;