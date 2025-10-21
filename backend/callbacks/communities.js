// @ts-check
import { CommUserPair } from "../schemas/communities.js";
import { addUserToCommunity, removeUserFromCommunity } from "../utils/communities.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function joinCommunity(req, res) {
  const { data, success, error } = await CommUserPair.safeParseAsync(req.body)

  if (!success)
    return res.status(400).send(error.issues);

  const { community_id, user_id } = data

  return addUserToCommunity(user_id, community_id)
    .then(res.send.bind(res))
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function leaveCommunity(req, res) {
  const { data, success, error } = await CommUserPair.safeParseAsync(req.query)

  if (!success)
    return res.status(400).send(error.issues);

  const { community_id, user_id } = data

  return removeUserFromCommunity(user_id, community_id)
    .then(res.send.bind(res))
}
