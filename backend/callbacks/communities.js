// @ts-check
import database from "../database.js";
import { CommUserPair } from "../schemas/communities.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function joinCommunity(req, res) {
  const { data, success, error } = await CommUserPair.safeParseAsync(req.body)

  if (!success)
    return res.status(400).send(error.issues);

  const { community_id, user_id } = data

  return database.from("community_members").insert({ community_id, user_id, joined_at: new Date() })
    .then(({ statusText }) => res.send(statusText))
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

  return database.from("community_members").delete().eq('community_id', community_id).eq('user_id', user_id).select()
    .then(({ statusText }) => res.send(statusText))
}
