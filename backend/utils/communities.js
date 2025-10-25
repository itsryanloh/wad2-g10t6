// @ts-check
import database from "../database.js";

/** @import {infer as zinfer} from "zod" */
/** @import {CommUserPair, CommId} from "../schemas/communities.js" */

const community_members = () => database.from("community_members")
const communities = () => database.from("communities")

export async function getAllCommunities() {
  return communities().select("id,name,description");
}

/**
 * @param {zinfer<CommId>} id
 */
export async function getCommunityById(id) {
  return communities().select().eq('id', id).limit(1).maybeSingle();
}

/**
 * @param {zinfer<CommUserPair>} param0
 */
export async function addUserToCommunity({ user_id, community_id }) {
  return community_members().insert({ community_id, user_id, joined_at: new Date() });
}

/**
 * @param {zinfer<CommUserPair>} param0
 */
export async function removeUserFromCommunity({ user_id, community_id }) {
  return community_members().delete().eq('community_id', community_id).eq('user_id', user_id);
}

/**
 * @param {string} areaName
 */
export async function getCommunityIdByAreaName(areaName) {
  return communities().select("id").ilike('location_name', areaName).limit(1).maybeSingle();
}
