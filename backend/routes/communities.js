// @ts-check
import express from 'express';
import { joinCommunity } from '../callbacks/communities.js';

const router = express.Router();

router.post("/join", joinCommunity)

export default router;
