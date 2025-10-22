// @ts-check
import express from 'express';
import { allCommunities, joinCommunity, leaveCommunity } from '../callbacks/communities.js';

const router = express.Router();

router.get("/", allCommunities)
router.post("/", joinCommunity)
router.delete("/", leaveCommunity)

export default router;
