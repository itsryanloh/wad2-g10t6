// @ts-check
import { CommId, CommUserPair, NewCommunity } from "../schemas/communities.js";
import { 
  getAllCommunities, 
  getCommunityById, 
  createNewCommunity,
  addUserToCommunity, 
  removeUserFromCommunity,
  getUserCommunitiesList,
  isUserMemberOfCommunity,
  getPostsByCommunityId
} from "../utils/communities.js";

/** @import {Request, Response} from "express" */

/**
 * Get all communities (with optional location filter)
 * @param {Request} req
 * @param {Response} res
 */
export async function allCommunities(req, res) {
  const { location } = req.query;
  return getAllCommunities(location).then(wrapSupabaseResponse(res));
}

/**
 * Get specific community by ID
 * @param {Request} req
 * @param {Response} res
 */
export async function getCommunity(req, res) {
  const { data, success, error } = CommId.safeParse(req.params.id);

  if (!success)
    return res.status(400).send(error.issues);

  return getCommunityById(data).then(wrapSupabaseResponse(res));
}
/**
 * Create a new community
 * @param {Request} req
 * @param {Response} res
 */
export async function createCommunity(req, res) {
  const { data, success, error } = await NewCommunity.safeParseAsync(req.body);

  if (!success)
    return res.status(400).send(error.issues);

  return createNewCommunity(data).then(wrapSupabaseResponse(res));
}

/**
 * Join a community
 * @param {Request} req
 * @param {Response} res
 */
export async function joinCommunity(req, res) {
  const communityId = req.params.id;
  const { data, success, error } = await CommUserPair.safeParseAsync({
    community_id: communityId,
    user_id: req.body.user_id
  });

  if (!success)
    return res.status(400).send(error.issues);

  return addUserToCommunity(data).then(wrapSupabaseResponse(res));
}

/**
 * Leave a community
 * @param {Request} req
 * @param {Response} res
 */
export async function leaveCommunity(req, res) {
  const communityId = req.params.id;
  const { data, success, error } = await CommUserPair.safeParseAsync({
    community_id: communityId,
    user_id: req.body.user_id
  });

  if (!success)
    return res.status(400).send(error.issues);

  return removeUserFromCommunity(data).then(wrapSupabaseResponse(res));
}

/**
 * Get all communities a user has joined
 * @param {Request} req
 * @param {Response} res
 */
export async function getUserCommunities(req, res) {
  const userId = req.params.userId;
  return getUserCommunitiesList(userId).then(wrapSupabaseResponse(res));
}

/**
 * Check if user is a member of a community
 * @param {Request} req
 * @param {Response} res
 */
export async function checkMembership(req, res) {
  const { data, success, error } = await CommUserPair.safeParseAsync({
    community_id: req.params.id,
    user_id: req.params.userId
  });

  if (!success)
    return res.status(400).send(error.issues);

  return isUserMemberOfCommunity(data).then(wrapSupabaseResponse(res));
}

/**
 * Get all posts from a community
 * @param {Request} req
 * @param {Response} res
 */
export async function getCommunityPosts(req, res) {
  const { data, success, error } = CommId.safeParse(req.params.id);

  if (!success)
    return res.status(400).send(error.issues);

  return getPostsByCommunityId(data).then(wrapSupabaseResponse(res));
}

/**
 * Wrapper function for Supabase responses
 * @param {Response} res 
 */
function wrapSupabaseResponse(res) {
  return reply => res.status(reply.status).send(reply.data);
}