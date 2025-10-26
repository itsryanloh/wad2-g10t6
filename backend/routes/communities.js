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
router.get("/", allCommunities); 
router.post("/", createCommunity); 

//User-specific route
router.get("/users/:userId", getUserCommunities); 

//Single community routes
router.get("/:id", getCommunity); 

//Membership routes
router.post("/:id/join", joinCommunity); 
router.delete("/:id/leave", leaveCommunity);
router.get("/:id/membership/:userId", checkMembership); 

//Content routes
router.get("/:id/posts", getCommunityPosts); 

export default router;