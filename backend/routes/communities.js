// @ts-check
import express from 'express';
import { allCommunities, getCommunity, joinCommunity, leaveCommunity } from '../callbacks/communities.js';

const router = express.Router();

router.get("/", allCommunities)
router.get("/:id", getCommunity)
router.post("/", joinCommunity)
router.delete("/", leaveCommunity)

export default router;
