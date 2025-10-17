// @ts-check
import express from 'express';
import { joinCommunity, leaveCommunity } from '../callbacks/communities.js';

const router = express.Router();

router.post("/", joinCommunity)
router.delete("/", leaveCommunity)

export default router;
