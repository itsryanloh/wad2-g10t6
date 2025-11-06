import express from "express";
import supabase from "../database.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Mark a post as adopted by the current user
router.post("/:postId/mark-adopted", async (req, res) => {
  const authHeader = req.headers.authorization;
  const { postId } = req.params;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ error: 'Unauthorized: No Bearer token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    
    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("username", payload.username)
      .single();

    if (userError || !userData) {
      return res.status(401).send({ error: 'User not found' });
    }

    // Check if post exists
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      return res.status(404).send({ error: 'Post not found' });
    }

    // Insert into adopted_posts table
    const { data, error } = await supabase
      .from("adopted_posts")
      .insert({
        user_id: userData.id,
        post_id: postId
      })
      .select();

    if (error) {
      // If duplicate, it means already adopted
      if (error.code === '23505') {
        return res.status(200).send({ message: 'Already adopted' });
      }
      return res.status(400).send({ error: error.message });
    }

    return res.status(201).send({ message: 'Adoption completed', data: data[0] });
  } catch (error) {
    console.error('Error marking adoption:', error);
    return res.status(401).send({ error: 'Invalid token' });
  }
});

export default router;