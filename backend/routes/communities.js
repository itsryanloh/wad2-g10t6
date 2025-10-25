import express from 'express';
import { 
  allCommunities, 
  getCommunity, 
  createCommunity,
  joinCommunity, 
  leaveCommunity,
  getUserCommunities,
  checkMembership,
  getCommunityPosts
} from '../callbacks/communities.js';

const router = express.Router();

//List/Create routes
router.get("/", allCommunities); //Get all communities (with optional ?location= filter)
router.post("/", createCommunity); //Create new community

//User-specific route
router.get("/users/:userId", getUserCommunities); //Get user's communities

//Single community routes
router.get("/:id", getCommunity); //Get single community

//Membership routes
router.post("/:id/join", joinCommunity); //Join community
router.delete("/:id/leave", leaveCommunity); //Leave community
router.get("/:id/membership/:userId", checkMembership); //Check if user is member

//Content routes
router.get("/:id/posts", getCommunityPosts); //Get community posts

export default router;