import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

//Configure multer for avatar uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
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

//UPLOAD avatar endpoint
router.post('/upload', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    //Generate unique filename with user ID if provided
    const userId = req.body.user_id || 'unknown';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${userId}-${timestamp}-${randomStr}-${req.file.originalname}`;

    //Upload to Supabase Storage userAvatars bucket
    const { data, error } = await supabase.storage
      .from('userAvatars')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }

    //Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('userAvatars')
      .getPublicUrl(filename);

    res.status(200).json({ 
      message: 'Avatar uploaded successfully',
      url: publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Error in avatar upload endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

//DELETE avatar endpoint
router.delete('/delete', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename required' });
    }

    const { error } = await supabase.storage
      .from('userAvatars')
      .remove([filename]);

    if (error) throw error;

    res.status(200).json({ 
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;