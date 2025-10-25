// @ts-check
import { CommId, CommUserPair } from "../schemas/communities.js";
import { addUserToCommunity, getAllCommunities, getCommunityById, removeUserFromCommunity } from "../utils/communities.js";

/** @import {Request, Response} from "express" */

/**
 * @param {Request} _req
 * @param {Response} res
 */
export async function allCommunities(_req, res) {
  return getAllCommunities().then(wrapSupabaseResponse(res))
}

/**
 * @param {Request} req
 * @param {Response} res
 */
export async function getCommunity(req, res) {
  const { data, success, error } = CommId.safeParse(req.params.id)

  if (!success)
    return res.status(400).send(error.issues);

  return getCommunityById(data)
    .then(wrapSupabaseResponse(res))
}

/**
 * @param {Request} req
 * @param {Response} res
 */
export async function joinCommunity(req, res) {
  const { data, success, error } = await CommUserPair.safeParseAsync(req.body)

  if (!success)
    return res.status(400).send(error.issues);

  return addUserToCommunity(data)
    .then(wrapSupabaseResponse(res))
}

/**
 * @param {Request} req
 * @param {Response} res
 */
export async function leaveCommunity(req, res) {
  const { data, success, error } = await CommUserPair.safeParseAsync(req.query)

  if (!success)
    return res.status(400).send(error.issues);

  return removeUserFromCommunity(data)
    .then(wrapSupabaseResponse(res))
}


/**
 * @param {Response} res 
 */
function wrapSupabaseResponse(res) {
  /**
   * @param {import("@supabase/supabase-js").PostgrestSingleResponse<any>} reply 
   */
  return reply => res.status(reply.status).send(reply.data)
}
